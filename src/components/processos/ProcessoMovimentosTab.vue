<template>
  <div
    class="bg-white q-pa-lg"
    style="border: 0.4px solid gray"
  >
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-subtitle1 text-weight-bold text-grey-9">
          Movimentações processuais
        </div>
        <div class="text-caption text-grey-6">
          Importadas da API pública do DataJud (CNJ)
        </div>
      </div>
      <q-btn
        unelevated
        color="secondary"
        icon="sync"
        label="Sincronizar"
        no-caps
        :loading="isSyncing"
        @click="sincronizar"
      />
    </div>

    <div
      v-if="isLoading"
      class="column items-center gap-md q-pa-xl"
    >
      <q-spinner-hourglass
        color="primary"
        size="3em"
      />
      <span class="text-grey-8">Carregando movimentações...</span>
    </div>

    <template v-else>
      <q-input
        v-if="movimentos.length > 0"
        v-model="filtro"
        dense
        outlined
        clearable
        debounce="300"
        placeholder="Buscar movimentação"
        class="q-mb-md"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-table
        flat
        bordered
        :rows="movimentos"
        :columns="columns"
        :filter="filtro"
        row-key="id"
        hide-pagination
        :pagination="{ rowsPerPage: 0 }"
      >
        <template #header="props">
          <q-tr :props="props">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="bg-grey-2 text-grey-8"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body-cell-dataHora="props">
          <q-td :props="props">
            <span class="movimento-data">
              {{ formatarDataAbreviadaCurta(props.row.dataHora) }}
            </span>
          </q-td>
        </template>

        <template #body-cell-nome="props">
          <q-td :props="props">
            <div class="row items-center gap-sm">
              <span class="text-grey-9">{{ props.row.nome }}</span>
              <ComplementosInfo :detalhes="props.row.detalhes" />
            </div>
          </q-td>
        </template>

        <template #body-cell-orgaoJulgador="props">
          <q-td :props="props">
            <span class="text-grey-7 text-caption">
              {{ props.row.orgaoJulgadorNome || '-' }}
            </span>
          </q-td>
        </template>

        <template #body-cell-acoes="props">
          <q-td
            :props="props"
            auto-width
          >
            <q-icon
              v-if="props.row.naTimeline"
              name="check_circle"
              color="positive"
              size="20px"
            >
              <q-tooltip>Já está na timeline</q-tooltip>
            </q-icon>
            <q-btn
              v-else
              flat
              round
              dense
              size="sm"
              icon="playlist_add"
              color="primary"
              @click="promover(props.row)"
            >
              <q-tooltip>Adicionar à timeline</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column items-center q-pa-xl text-grey-5">
            <q-icon
              name="gavel"
              size="3em"
            />
            <p class="q-mt-md text-body2 text-center">
              Nenhuma movimentação importada para este processo. Clique em
              Sincronizar para buscar no DataJud.
            </p>
          </div>
        </template>
      </q-table>
    </template>
  </div>

  <EventoFormDialog
    v-model="dialogAberto"
    :processo-id="processoId"
    :sugestao="sugestao"
    @saved="carregarMovimentos"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { type QTableColumn } from 'quasar'
import { useMovimentoService } from '@/services'
import { useNotification } from '@/composables/useNotification'
import type { MovimentoProcesso } from '@/types/processos/MovimentoProcesso'
import { formatarDataAbreviadaCurta, isoToBr } from '@/utils/date'
import { tipoEventoSugerido } from '@/utils/movimento'
import ComplementosInfo from '@/components/processos/ComplementosInfo.vue'
import type { EventoSugerido } from '@/types/timelines/TimelineEvento'
import EventoFormDialog from '@/components/timelines/EventoFormDialog.vue'
import { getApiErrorMessage } from '@/utils/apiError'

const props = defineProps<{ processoId: string }>()

const movimentoService = useMovimentoService()
const notification = useNotification()

const isLoading = ref(true)
const isSyncing = ref(false)
const filtro = ref('')
const movimentos = ref<MovimentoProcesso[]>([])
const dialogAberto = ref(false)
const sugestao = ref<EventoSugerido | null>(null)

const columns: QTableColumn[] = [
  {
    name: 'dataHora',
    field: 'dataHora',
    label: 'Data',
    align: 'left',
    sortable: true,
  },
  { name: 'nome', field: 'nome', label: 'Movimentação', align: 'left' },
  {
    name: 'orgaoJulgador',
    field: 'orgaoJulgadorNome',
    label: 'Órgão julgador',
    align: 'left',
  },
  { name: 'acoes', field: 'id', label: '', align: 'right' },
]

async function carregarMovimentos() {
  isLoading.value = true
  try {
    movimentos.value = await movimentoService.listByProcesso(props.processoId)
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

function promover(movimento: MovimentoProcesso) {
  sugestao.value = {
    titulo: movimento.nome,
    tipo: tipoEventoSugerido(movimento.nome),
    data: isoToBr(movimento.dataHora),
    movimentoId: movimento.id,
  }
  dialogAberto.value = true
}

async function sincronizar() {
  isSyncing.value = true
  try {
    const { inseridos } = await movimentoService.sincronizar(props.processoId)

    if (inseridos === 0) {
      notification.info('Nenhuma movimentação nova encontrada.')
    } else {
      notification.success(
        inseridos === 1
          ? '1 movimentação importada.'
          : `${inseridos} movimentações importadas.`,
      )
      await carregarMovimentos()
    }
  } catch (error) {
    notification.error(getApiErrorMessage(error))
  } finally {
    isSyncing.value = false
  }
}

onMounted(carregarMovimentos)
</script>

<style scoped>
.movimento-data {
  font-weight: 600;
  font-size: 13px;
  color: #424242;
  white-space: nowrap;
}
</style>

<template>
  <div class="q-pa-md column gap-md">
    <div
      class="flex justify-between items-center"
      style="height: 80px"
    >
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Movimentações</h4>
        <span class="text-caption text-grey-6">
          Andamentos importados do DataJud (CNJ) em todos os processos
        </span>
      </div>
    </div>

    <div class="row gap-md">
      <div class="col-12 col-md-4">
        <SelectComponent
          v-model="filtroClienteId"
          label="Cliente"
          :options="clienteOptions"
          option-value="value"
          option-label="label"
          bg-color="white"
        />
      </div>

      <div class="col-12 col-md-4">
        <SelectComponent
          v-model="filtroProcessoId"
          label="Processo"
          :options="processoOptions"
          option-value="value"
          option-label="label"
          bg-color="white"
        />
      </div>

      <div class="col-12 col-md-2">
        <SelectComponent
          v-model="filtroTimeline"
          label="Timeline"
          :options="OPCOES_TIMELINE"
          option-value="value"
          option-label="label"
          bg-color="white"
        />
      </div>
    </div>

    <q-infinite-scroll
      :disable="!more || isLoading"
      @load="loadMore"
    >
      <q-table
        flat
        bordered
        :rows="movimentos"
        :columns="columns"
        row-key="id"
        :loading="isLoading"
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

        <template #body-cell-processo="props">
          <q-td :props="props">
            <a
              class="processo-link"
              @click="irParaProcesso(props.row.processoId)"
            >
              {{ props.row.processo?.numeroProcesso ?? '-' }}
            </a>
          </q-td>
        </template>

        <template #body-cell-cliente="props">
          <q-td :props="props">
            <span class="text-grey-8 text-caption">
              {{ props.row.processo?.cliente?.nome ?? '-' }}
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
              Nenhuma movimentação importada ainda.
            </p>
          </div>
        </template>
      </q-table>

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots
            color="primary"
            size="40px"
          />
        </div>
      </template>
    </q-infinite-scroll>
  </div>

  <EventoFormDialog
    v-model="dialogAberto"
    :processo-id="processoIdSelecionado"
    :sugestao="sugestao"
    @saved="refresh"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { type QTableColumn } from 'quasar'
import {
  useClienteService,
  useMovimentoService,
  useProcessoService,
} from '@/services'
import SelectComponent from '@/components/SelectComponent.vue'
import EventoFormDialog from '@/components/timelines/EventoFormDialog.vue'
import type { MovimentoProcesso } from '@/types/processos/MovimentoProcesso'
import type { Processo } from '@/types/processos/Processo'
import type { Cliente } from '@/types/clientes/Cliente'
import type { EventoSugerido } from '@/types/timelines/TimelineEvento'
import { formatarDataAbreviadaCurta, isoToBr } from '@/utils/date'
import { tipoEventoSugerido } from '@/utils/movimento'
import ComplementosInfo from '@/components/processos/ComplementosInfo.vue'

const rpp = 30

const OPCOES_TIMELINE = [
  { label: 'Todas', value: 'TODAS' },
  { label: 'Não adicionadas', value: 'PENDENTES' },
  { label: 'Na timeline', value: 'NA_TIMELINE' },
]

const router = useRouter()
const movimentoService = useMovimentoService()
const processoService = useProcessoService()
const clienteService = useClienteService()

const isLoading = ref(false)
const movimentos = ref<MovimentoProcesso[]>([])
const processos = ref<Processo[]>([])
const clientes = ref<Cliente[]>([])
const filtroProcessoId = ref<string | null>(null)
const filtroClienteId = ref<string | null>(null)
const filtroTimeline = ref('TODAS')
const page = ref(1)
const more = ref(false)

const dialogAberto = ref(false)
const sugestao = ref<EventoSugerido | null>(null)
const processoIdSelecionado = ref('')

const processoOptions = computed(() =>
  processos.value
    .filter(
      (processo) =>
        !filtroClienteId.value || processo.clienteId === filtroClienteId.value,
    )
    .map((processo) => ({
      label: processo.numeroProcesso,
      value: processo.id,
    })),
)

const clienteOptions = computed(() =>
  clientes.value.map((cliente) => ({ label: cliente.nome, value: cliente.id })),
)

const columns: QTableColumn[] = [
  {
    name: 'dataHora',
    field: 'dataHora',
    label: 'Data',
    align: 'left',
    sortable: true,
  },
  { name: 'processo', field: 'processoId', label: 'Processo', align: 'left' },
  { name: 'cliente', field: 'processoId', label: 'Cliente', align: 'left' },
  { name: 'nome', field: 'nome', label: 'Movimentação', align: 'left' },
  {
    name: 'orgaoJulgador',
    field: 'orgaoJulgadorNome',
    label: 'Órgão julgador',
    align: 'left',
  },
  { name: 'acoes', field: 'id', label: '', align: 'right' },
]

function filtrosAtivos() {
  return {
    ...(filtroClienteId.value && { clienteId: filtroClienteId.value }),
    ...(filtroProcessoId.value && { processoId: filtroProcessoId.value }),
    ...(filtroTimeline.value !== 'TODAS' && {
      naTimeline: filtroTimeline.value === 'NA_TIMELINE',
    }),
  }
}

async function load() {
  isLoading.value = true
  try {
    const response = await movimentoService.getAll({
      page: 1,
      rpp,
      ...filtrosAtivos(),
    })
    movimentos.value = response.list
    more.value = response.more
    page.value = response.page
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

async function loadMore(_index: number, done: (stop?: boolean) => void) {
  if (!more.value || isLoading.value) {
    done(true)
    return
  }

  try {
    const response = await movimentoService.getAll({
      page: page.value + 1,
      rpp,
      ...filtrosAtivos(),
    })
    movimentos.value = [...movimentos.value, ...response.list]
    more.value = response.more
    page.value = response.page
    done(!more.value)
  } catch (error) {
    console.error(error)
    done(true)
  }
}

function refresh() {
  page.value = 1
  load()
}

function promover(movimento: MovimentoProcesso) {
  processoIdSelecionado.value = movimento.processoId
  sugestao.value = {
    titulo: movimento.nome,
    tipo: tipoEventoSugerido(movimento.nome),
    data: isoToBr(movimento.dataHora),
    movimentoId: movimento.id,
  }
  dialogAberto.value = true
}

function irParaProcesso(processoId: string) {
  router.push({
    name: 'processo-view',
    params: { id: processoId },
    query: { tab: 'movimentacoes' },
  })
}

watch([filtroProcessoId, filtroTimeline], refresh)

watch(filtroClienteId, () => {
  filtroProcessoId.value = null
  refresh()
})

onMounted(async () => {
  try {
    const [processosResponse, clientesResponse] = await Promise.all([
      processoService.getAll({ page: 1, rpp: 200 }),
      clienteService.getAll({ page: 1, rpp: 200 }),
    ])
    processos.value = processosResponse.list
    clientes.value = clientesResponse.list
  } catch (error) {
    console.error(error)
  }

  await load()
})
</script>

<style scoped>
.movimento-data {
  font-weight: 600;
  font-size: 13px;
  color: #424242;
  white-space: nowrap;
}

.processo-link {
  color: #003366;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
}

.processo-link:hover {
  text-decoration: underline;
}
</style>

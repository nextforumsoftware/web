<template>
  <div
    class="bg-white q-pa-lg"
    style="border: 0.4px solid gray"
  >
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1 text-weight-bold text-grey-9">
        Prazos do processo
      </div>
      <q-btn
        unelevated
        color="secondary"
        icon="add"
        label="Novo Prazo"
        no-caps
        @click="abrirFormulario()"
      />
    </div>

    <div
      v-if="isLoading"
      class="column items-center q-gutter-y-md q-pa-xl"
    >
      <q-spinner-hourglass
        color="primary"
        size="3em"
      />
      <span class="text-grey-8">Carregando prazos...</span>
    </div>

    <q-table
      v-else
      flat
      bordered
      :rows="prazosSorted"
      :columns="columns"
      row-key="id"
      hide-bottom
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

      <template #body-cell-data="props">
        <q-td :props="props">
          <span
            class="prazo-date"
            :class="prazoUrgenciaClass(props.row.status, props.row.data)"
          >
            {{ formatarData(props.row.data) }}
          </span>
          <div class="prazo-hint text-grey-6">
            {{ prazoUrgenciaLabel(props.row.status, props.row.data) }}
          </div>
        </q-td>
      </template>

      <template #body-cell-tipo="props">
        <q-td :props="props">
          <span
            class="tipo-chip"
            :style="{
              background: prazoTipoColorHex(props.row.tipo) + '18',
              color: prazoTipoColorHex(props.row.tipo),
            }"
          >
            {{ prazoTipoLabel(props.row.tipo) }}
          </span>
        </q-td>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="prazoStatusColor(props.row.status)"
            :label="prazoStatusLabel(props.row.status)"
          />
        </q-td>
      </template>

      <template #body-cell-acoes="props">
        <q-td
          :props="props"
          auto-width
        >
          <div class="row no-wrap q-gutter-xs">
            <q-btn
              v-if="props.row.status === 'PENDENTE'"
              flat
              round
              dense
              size="sm"
              icon="check_circle"
              color="positive"
              @click="marcarComoCumprido(props.row)"
            >
              <q-tooltip>Marcar como cumprido</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="edit"
              color="grey-6"
              @click="abrirFormulario(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="delete_outline"
              color="negative"
              @click="confirmarExclusao(props.row)"
            >
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width column items-center q-pa-xl text-grey-5">
          <q-icon
            name="event_busy"
            size="3em"
          />
          <p class="q-mt-md text-body2 text-center">
            Nenhum prazo cadastrado para este processo.
          </p>
        </div>
      </template>
    </q-table>
  </div>

  <PrazoFormDialog
    v-model="dialogAberto"
    :prazo="editandoPrazo"
    :processos="[]"
    :usuarios="usuarioOptions"
    :processo-id-fixo="processoId"
    @saved="onSalvo"
  />

  <q-dialog v-model="dialogExclusao">
    <q-card style="min-width: 340px">
      <q-card-section>
        <div class="text-h6">Excluir prazo?</div>
        <p class="text-grey-7 q-mt-sm q-mb-none">
          "<strong>{{ prazoParaExcluir?.titulo }}</strong
          >" será removido permanentemente.
        </p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Cancelar"
          v-close-popup
        />
        <q-btn
          unelevated
          no-caps
          color="negative"
          label="Excluir"
          :loading="isDeleting"
          @click="excluirPrazo"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { type QTableColumn } from 'quasar'
import { usePrazoService, useUsuarioService } from '@/services'
import { useNotification } from '@/composables/useNotification'
import type { Prazo } from '@/types/prazos/Prazo'
import type { Usuario } from '@/types/usuarios/Usuario'
import PrazoFormDialog from './PrazoFormDialog.vue'
import { formatarData } from '@/utils/date'
import {
  prazoStatusColor,
  prazoStatusLabel,
  prazoTipoColorHex,
  prazoTipoLabel,
  prazoUrgenciaClass,
  prazoUrgenciaLabel,
} from '@/utils/prazo'

const props = defineProps<{ processoId: string }>()

const prazoService = usePrazoService()
const usuarioService = useUsuarioService()
const notification = useNotification()

const isLoading = ref(true)
const isDeleting = ref(false)
const prazos = ref<Prazo[]>([])
const usuarios = ref<Usuario[]>([])

const dialogAberto = ref(false)
const dialogExclusao = ref(false)
const editandoPrazo = ref<Prazo | null>(null)
const prazoParaExcluir = ref<Prazo | null>(null)

const usuarioOptions = computed(() =>
  usuarios.value.map((usuario) => ({ label: usuario.nome, value: usuario.id })),
)

const prazosSorted = computed(() =>
  [...prazos.value].sort(
    (prazoA, prazoB) =>
      new Date(prazoA.data).getTime() - new Date(prazoB.data).getTime(),
  ),
)

const columns: QTableColumn[] = [
  { name: 'data', field: 'data', label: 'Data', align: 'left', sortable: true },
  { name: 'titulo', field: 'titulo', label: 'Prazo', align: 'left' },
  { name: 'tipo', field: 'tipo', label: 'Tipo', align: 'left' },
  { name: 'status', field: 'status', label: 'Status', align: 'left' },
  { name: 'acoes', field: 'id', label: '', align: 'right' },
]

async function carregarPrazos() {
  isLoading.value = true
  try {
    const response = await prazoService.getAll({
      page: 1,
      rpp: 100,
      processoId: props.processoId,
    })
    prazos.value = response.list
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

function abrirFormulario(prazo?: Prazo) {
  editandoPrazo.value = prazo ?? null
  dialogAberto.value = true
}

function confirmarExclusao(prazo: Prazo) {
  prazoParaExcluir.value = prazo
  dialogExclusao.value = true
}

function onSalvo() {
  carregarPrazos()
}

async function marcarComoCumprido(prazo: Prazo) {
  try {
    await prazoService.updateStatus(prazo.id, 'CUMPRIDO')
    notification.success('Prazo marcado como cumprido!')
    carregarPrazos()
  } catch {
    notification.error('Erro ao atualizar prazo.')
  }
}

async function excluirPrazo() {
  if (!prazoParaExcluir.value) return
  isDeleting.value = true
  try {
    await prazoService.remove(prazoParaExcluir.value.id)
    notification.success('Prazo excluído.')
    dialogExclusao.value = false
    carregarPrazos()
  } catch {
    notification.error('Erro ao excluir prazo.')
  } finally {
    isDeleting.value = false
  }
}

onMounted(async () => {
  try {
    const usuariosResponse = await usuarioService.getAll({ page: 1, rpp: 100 })
    usuarios.value = usuariosResponse.list
  } catch (error) {
    console.error(error)
  }

  await carregarPrazos()
})
</script>

<style scoped>
.prazo-date {
  font-weight: 600;
  font-size: 13px;
}

.prazo-date--vencido,
.prazo-date--urgente {
  color: #c10015;
}

.prazo-date--atencao {
  color: #c6a75e;
}

.prazo-date--ok {
  color: #424242;
}

.prazo-hint {
  font-size: 11px;
}

.tipo-chip {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
  white-space: nowrap;
}
</style>

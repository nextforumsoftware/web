<template>
  <div class="q-pa-md">
    <div
      class="flex justify-between items-center q-mb-sm"
      style="height: 80px"
    >
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Prazos</h4>
        <p class="text-terciary q-my-none">Agenda de prazos processuais</p>
      </div>
      <q-btn
        color="secondary"
        icon="add_circle"
        label="Novo Prazo"
        style="max-width: 200px"
        @click="abrirFormulario()"
      />
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div
        v-for="card in statsCards"
        :key="card.label"
        class="col-6 col-sm-4 col-md-3"
      >
        <div class="stat-card">
          <div
            class="stat-card__icon-wrapper"
            :style="{ background: `${card.color}1A` }"
          >
            <q-icon
              :name="card.icon"
              size="22px"
              :style="{ color: card.color }"
            />
          </div>
          <div
            class="stat-card__number"
            :style="{ color: card.color }"
          >
            {{ card.total }}
          </div>
          <div class="stat-card__label">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filters.term"
          outlined
          dense
          bg-color="white"
          placeholder="Buscar por título do prazo..."
          clearable
          clear-icon="close"
        >
          <template #prepend>
            <q-icon
              name="search"
              size="18px"
            />
          </template>
        </q-input>
      </div>

      <div class="col-6 col-md-3">
        <q-select
          v-model="filters.status"
          outlined
          dense
          bg-color="white"
          label="Status"
          clearable
          emit-value
          map-options
          :options="STATUS_PRAZO"
        />
      </div>

      <div class="col-6 col-md-5">
        <q-select
          v-model="filters.processoId"
          outlined
          dense
          bg-color="white"
          label="Processo"
          clearable
          emit-value
          map-options
          :options="processoOptions"
        />
      </div>
    </div>
  </div>

  <div class="q-pa-md q-pt-none">
    <div
      v-if="isLoading"
      class="column items-center q-gutter-y-md q-pa-xl"
    >
      <q-spinner-hourglass
        color="primary"
        size="4em"
      />
      <span class="text-grey-8">Carregando prazos...</span>
    </div>

    <q-infinite-scroll
      v-else
      :offset="250"
      @load="loadMore"
    >
      <q-table
        flat
        bordered
        :rows="prazos"
        :columns="columns"
        row-key="id"
        :hide-bottom="prazos.length > 0"
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

        <template #body-cell-titulo="props">
          <q-td :props="props">
            <span class="text-weight-medium text-grey-9">{{
              props.row.titulo
            }}</span>
          </q-td>
        </template>

        <template #body-cell-processo="props">
          <q-td :props="props">
            <span
              v-if="props.row.processo"
              class="text-primary cursor-pointer"
              @click="irParaProcesso(props.row.processo.id)"
            >
              {{ props.row.processo.numeroProcesso }}
            </span>
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

        <template #body-cell-responsavel="props">
          <q-td :props="props">
            <span class="text-grey-8">{{
              props.row.responsavel?.nome ?? '-'
            }}</span>
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
              size="4em"
            />
            <p class="q-mt-md text-body2 text-center">
              Nenhum prazo encontrado.<br />Cadastre o primeiro para começar a
              acompanhar sua agenda.
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

  <PrazoFormDialog
    v-model="dialogAberto"
    :prazo="editandoPrazo"
    :processos="processoOptions"
    :usuarios="usuarioOptions"
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
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce, type QTableColumn } from 'quasar'
import {
  usePrazoService,
  useProcessoService,
  useUsuarioService,
} from '@/services'
import { useNotification } from '@/composables/useNotification'
import type { Prazo } from '@/types/prazos/Prazo'
import type { Processo } from '@/types/processos/Processo'
import type { Usuario } from '@/types/usuarios/Usuario'
import PrazoFormDialog from '@/components/prazos/PrazoFormDialog.vue'
import { formatarData } from '@/utils/date'
import {
  STATUS_PRAZO,
  prazoStatusColor,
  prazoStatusLabel,
  prazoTipoColorHex,
  prazoTipoLabel,
  prazoUrgenciaClass,
  prazoUrgenciaLabel,
} from '@/utils/prazo'

const route = useRoute()
const router = useRouter()
const prazoService = usePrazoService()
const processoService = useProcessoService()
const usuarioService = useUsuarioService()
const notification = useNotification()

const prazos = ref<Prazo[]>([])
const processos = ref<Processo[]>([])
const usuarios = ref<Usuario[]>([])
const dashboard = ref({ pendentes: 0, vencidos: 0, proximos7Dias: 0 })

const isLoading = ref(true)
const isDeleting = ref(false)
const more = ref(false)
const page = ref(1)
const rpp = 20

const dialogAberto = ref(false)
const dialogExclusao = ref(false)
const editandoPrazo = ref<Prazo | null>(null)
const prazoParaExcluir = ref<Prazo | null>(null)

const filters = reactive({
  term: '',
  status: null as string | null,
  processoId: (route.query.processoId as string) ?? null,
})

const processoOptions = computed(() =>
  processos.value.map((processo) => ({
    label: processo.numeroProcesso,
    value: processo.id,
  })),
)

const usuarioOptions = computed(() =>
  usuarios.value.map((usuario) => ({ label: usuario.nome, value: usuario.id })),
)

const statsCards = computed(() => [
  {
    label: 'Pendentes',
    total: dashboard.value.pendentes,
    color: '#003366',
    icon: 'pending_actions',
  },
  {
    label: 'Vencidos',
    total: dashboard.value.vencidos,
    color: '#C10015',
    icon: 'error_outline',
  },
  {
    label: 'Próximos 7 dias',
    total: dashboard.value.proximos7Dias,
    color: '#C6A75E',
    icon: 'schedule',
  },
])

const columns: QTableColumn[] = [
  { name: 'data', field: 'data', label: 'Data', align: 'left', sortable: true },
  { name: 'titulo', field: 'titulo', label: 'Prazo', align: 'left' },
  { name: 'processo', field: 'processo', label: 'Processo', align: 'left' },
  { name: 'tipo', field: 'tipo', label: 'Tipo', align: 'left' },
  {
    name: 'responsavel',
    field: 'responsavel',
    label: 'Responsável',
    align: 'left',
  },
  { name: 'status', field: 'status', label: 'Status', align: 'left' },
  { name: 'acoes', field: 'id', label: '', align: 'right' },
]

function activeFilters() {
  return {
    ...(filters.term?.trim() && { term: filters.term.trim() }),
    ...(filters.status && { status: filters.status }),
    ...(filters.processoId && { processoId: filters.processoId }),
  }
}

async function load() {
  isLoading.value = true
  try {
    const response = await prazoService.getAll({
      page: 1,
      rpp,
      ...activeFilters(),
    })
    prazos.value = response.list
    more.value = response.more
    page.value = response.page
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

function refresh() {
  page.value = 1
  load()
}

async function loadMore(_: number, done: (stop?: boolean) => void) {
  if (!more.value) return done(true)

  try {
    page.value += 1
    const response = await prazoService.getAll({
      page: page.value,
      rpp,
      ...activeFilters(),
    })
    prazos.value = prazos.value.concat(response.list)
    more.value = response.more
    done()
  } catch (error) {
    console.error(error)
    done(true)
  }
}

async function carregarDashboard() {
  try {
    const data = await prazoService.getDashboard()
    dashboard.value = {
      pendentes: data.pendentes,
      vencidos: data.vencidos,
      proximos7Dias: data.proximos7Dias,
    }
  } catch (error) {
    console.error(error)
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
  refresh()
  carregarDashboard()
}

async function marcarComoCumprido(prazo: Prazo) {
  try {
    await prazoService.updateStatus(prazo.id, 'CUMPRIDO')
    notification.success('Prazo marcado como cumprido!')
    refresh()
    carregarDashboard()
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
    refresh()
    carregarDashboard()
  } catch {
    notification.error('Erro ao excluir prazo.')
  } finally {
    isDeleting.value = false
  }
}

function irParaProcesso(processoId: string) {
  router.push({ name: 'processo-view', params: { id: processoId } })
}

watch(filters, debounce(refresh, 500), { deep: true })

onMounted(async () => {
  try {
    const [processosResponse, usuariosResponse] = await Promise.all([
      processoService.getAll({ page: 1, rpp: 100 }),
      usuarioService.getAll({ page: 1, rpp: 100 }),
    ])
    processos.value = processosResponse.list
    usuarios.value = usuariosResponse.list
  } catch (error) {
    console.error(error)
  }

  await Promise.all([load(), carregarDashboard()])
})
</script>

<style scoped>
.stat-card {
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s;
}

.stat-card:hover {
  border-color: #bdbdbd;
}

.stat-card__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.stat-card__number {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.stat-card__label {
  font-size: 13px;
  color: #212121;
  font-weight: 600;
  font-variant: small-caps;
  text-transform: lowercase;
}

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

<template>
  <q-page
    padding
    class="column gap-md container"
  >
    <div class="row justify-between items-center">
      <div class="column">
        <h4 class="text-terciary text-bold q-my-sm">Honorários</h4>
        <p class="text-terciary q-my-none">Contratos de honorários por cliente</p>
      </div>
      <q-btn
        color="secondary"
        icon="add_circle"
        label="Novo honorário"
        style="max-width: 220px"
        @click="abrirFormulario()"
      />
    </div>

    <div class="row gap-sm">
      <q-input
        v-model="filters.term"
        class="col-12 col-md"
        outlined
        dense
        bg-color="white"
        placeholder="Buscar por descrição ou cliente..."
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

      <q-select
        v-model="filters.tipo"
        class="col"
        outlined
        dense
        bg-color="white"
        label="Tipo"
        clearable
        emit-value
        map-options
        :options="tipoOptions"
      />

      <q-select
        v-model="filters.clienteId"
        class="col"
        outlined
        dense
        bg-color="white"
        label="Cliente"
        clearable
        emit-value
        map-options
        :options="clienteOptions"
      />
    </div>

    <div
      v-if="isLoading"
      class="column items-center gap-md q-pa-xl"
    >
      <q-spinner-hourglass
        color="primary"
        size="4em"
      />
      <span class="text-grey-8">Carregando honorários...</span>
    </div>

    <q-infinite-scroll
      v-else
      :offset="250"
      @load="loadMore"
    >
      <q-table
        flat
        bordered
        :rows="honorarios"
        :columns="columns"
        row-key="id"
        :hide-bottom="honorarios.length > 0"
        :pagination="{ rowsPerPage: 0 }"
        @row-click="(_event, row) => irParaHonorario(row.id)"
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

        <template #body-cell-honorario="props">
          <q-td
            :props="props"
            class="cursor-pointer"
          >
            <div class="column">
              <span class="text-weight-medium text-grey-9">
                {{ props.row.descricao }}
              </span>
              <span class="text-caption text-grey-6">
                {{ props.row.cliente?.nome }}
                <template v-if="props.row.processo">
                  · {{ props.row.processo.numeroProcesso }}
                </template>
              </span>
            </div>
          </q-td>
        </template>

        <template #body-cell-tipo="props">
          <q-td :props="props">
            <q-badge
              rounded
    class="q-px-sm q-py-xs text-weight-bold"
              :color="getTipoHonorarioSettings(props.row.tipo).color"
              :text-color="getTipoHonorarioSettings(props.row.tipo).textColor"
              :label="getTipoHonorarioSettings(props.row.tipo).label"
            />
          </q-td>
        </template>

        <template #body-cell-total="props">
          <q-td :props="props">
            <span class="text-grey-9">
              {{ formatarMoeda(props.row.resumo.valorTotal) }}
            </span>
          </q-td>
        </template>

        <template #body-cell-recebido="props">
          <q-td :props="props">
            <div class="column gap-xs progresso">
              <span class="text-grey-9">
                {{ formatarMoeda(props.row.resumo.valorRecebido) }}
              </span>
              <q-linear-progress
                rounded
                size="6px"
                color="positive"
                track-color="grey-3"
                :value="progresso(props.row)"
              />
              <span class="text-caption text-grey-6">
                {{ props.row.resumo.quantidadePagas }} de
                {{ props.row.resumo.quantidadeParcelas }} parcela(s)
              </span>
            </div>
          </q-td>
        </template>

        <template #body-cell-atraso="props">
          <q-td :props="props">
            <span
              v-if="props.row.resumo.valorEmAtraso > 0"
              class="text-negative text-weight-medium"
            >
              {{ formatarMoeda(props.row.resumo.valorEmAtraso) }}
            </span>
            <span
              v-else
              class="text-grey-5"
              >-</span
            >
          </q-td>
        </template>

        <template #body-cell-acoes="props">
          <q-td
            :props="props"
            auto-width
          >
            <div class="row no-wrap gap-xs">
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="edit"
                color="grey-6"
                @click.stop="abrirFormulario(props.row)"
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
                @click.stop="confirmarExclusao(props.row)"
              >
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column items-center q-pa-xl text-grey-5">
            <q-icon
              name="handshake"
              size="4em"
            />
            <p class="q-mt-md text-body2 text-center">
              Nenhum honorário encontrado.<br />Cadastre o primeiro para gerar
              as parcelas automaticamente.
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
  </q-page>

  <HonorarioFormDialog
    v-model="dialogAberto"
    :honorario="editandoHonorario"
    :clientes="clienteOptions"
    :processos="processos"
    @saved="refresh"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { debounce, useQuasar, type QTableColumn } from 'quasar'
import {
  useClienteService,
  useFinanceiroService,
  useProcessoService,
} from '@/services'
import { useNotification } from '@/composables/useNotification'
import {
  TipoHonorarioSettings,
  getTipoHonorarioSettings,
  type Honorario,
  type TipoHonorarioEnum,
} from '@/types/financeiro/Honorario'
import type { Cliente } from '@/types/clientes/Cliente'
import type { Processo } from '@/types/processos/Processo'
import HonorarioFormDialog from '@/components/financeiro/HonorarioFormDialog.vue'
import { formatarMoeda } from '@/utils/financeiro'
import { getApiErrorMessage } from '@/utils/apiError'

const $q = useQuasar()
const router = useRouter()
const financeiroService = useFinanceiroService()
const clienteService = useClienteService()
const processoService = useProcessoService()
const notification = useNotification()

const honorarios = ref<Honorario[]>([])
const clientes = ref<Cliente[]>([])
const processos = ref<Processo[]>([])

const isLoading = ref(true)
const more = ref(false)
const page = ref(1)
const rpp = 20

const dialogAberto = ref(false)
const editandoHonorario = ref<Honorario | null>(null)

const tipoOptions = Object.values(TipoHonorarioSettings)

const filters = reactive({
  term: '',
  tipo: null as TipoHonorarioEnum | null,
  clienteId: null as string | null,
})

const clienteOptions = computed(() =>
  clientes.value.map((cliente) => ({ label: cliente.nome, value: cliente.id })),
)

const columns: QTableColumn[] = [
  { name: 'honorario', field: 'descricao', label: 'Honorário', align: 'left' },
  { name: 'tipo', field: 'tipo', label: 'Tipo', align: 'left' },
  { name: 'total', field: 'resumo', label: 'Total', align: 'right' },
  { name: 'recebido', field: 'resumo', label: 'Recebido', align: 'left' },
  { name: 'atraso', field: 'resumo', label: 'Em atraso', align: 'right' },
  { name: 'acoes', field: 'id', label: '', align: 'right' },
]

function progresso(honorario: Honorario): number {
  if (honorario.resumo.valorTotal <= 0) return 0
  return honorario.resumo.valorRecebido / honorario.resumo.valorTotal
}

function activeFilters() {
  return {
    ...(filters.term?.trim() && { term: filters.term.trim() }),
    ...(filters.tipo && { tipo: filters.tipo }),
    ...(filters.clienteId && { clienteId: filters.clienteId }),
  }
}

let versaoDaLista = 0

async function load() {
  versaoDaLista += 1
  const versao = versaoDaLista

  isLoading.value = true
  try {
    const response = await financeiroService.getHonorarios({
      page: 1,
      rpp,
      ...activeFilters(),
    })
    if (versao !== versaoDaLista) return

    honorarios.value = response.list
    more.value = response.more
    page.value = response.page
  } catch (error) {
    console.error(error)
  } finally {
    if (versao === versaoDaLista) isLoading.value = false
  }
}

async function loadMore(_: number, done: (stop?: boolean) => void) {
  if (!more.value) return done(true)

  const versao = versaoDaLista
  const proximaPagina = page.value + 1

  try {
    const response = await financeiroService.getHonorarios({
      page: proximaPagina,
      rpp,
      ...activeFilters(),
    })
    if (versao !== versaoDaLista) return done()

    honorarios.value = honorarios.value.concat(response.list)
    page.value = proximaPagina
    more.value = response.more
    done()
  } catch (error) {
    console.error(error)
    done(true)
  }
}

function refresh() {
  page.value = 1
  load()
}

function abrirFormulario(honorario?: Honorario) {
  editandoHonorario.value = honorario ?? null
  dialogAberto.value = true
}

function irParaHonorario(honorarioId: string) {
  router.push({ name: 'financeiro-honorario-view', params: { id: honorarioId } })
}

function confirmarExclusao(honorario: Honorario) {
  $q.dialog({
    title: 'Excluir honorário',
    message: `"${honorario.descricao}" e todas as suas parcelas serão removidos permanentemente.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Excluir', color: 'negative', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await financeiroService.removeHonorario(honorario.id)
      notification.success('Honorário excluído.')
      refresh()
    } catch (error) {
      notification.error(getApiErrorMessage(error, 'Erro ao excluir honorário.'))
    }
  })
}

watch(filters, debounce(refresh, 500), { deep: true })

onMounted(async () => {
  try {
    const [clientesResponse, processosResponse] = await Promise.all([
      clienteService.getAll({ page: 1, rpp: 200 }),
      processoService.getAll({ page: 1, rpp: 200 }),
    ])
    clientes.value = clientesResponse.list
    processos.value = processosResponse.list
  } catch (error) {
    console.error(error)
  }

  await load()
})
</script>

<style scoped>
.progresso {
  min-width: 140px;
}
</style>

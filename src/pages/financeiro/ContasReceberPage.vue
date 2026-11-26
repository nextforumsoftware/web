<template>
  <q-page
    padding
    class="column gap-md container"
  >
    <div class="row justify-between items-center">
      <div class="column">
        <h4 class="text-terciary text-bold q-my-sm">Contas a receber</h4>
        <p class="text-terciary q-my-none">Parcelas de honorários do escritório</p>
      </div>
      <q-btn
        color="secondary"
        icon="add_circle"
        label="Novo honorário"
        style="max-width: 220px"
        @click="dialogHonorario = true"
      />
    </div>

    <div class="cards-grid">
      <ValorCard
        v-for="card in cards"
        :key="card.label"
        v-bind="card"
      />
    </div>

    <div class="row gap-sm">
      <q-input
        v-model="filters.term"
        class="col-12 col-md"
        outlined
        dense
        bg-color="white"
        placeholder="Buscar por cliente ou honorário..."
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
        v-model="filters.situacao"
        class="col"
        outlined
        dense
        bg-color="white"
        label="Situação"
        clearable
        emit-value
        map-options
        :options="situacaoOptions"
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
      <span class="text-grey-8">Carregando parcelas...</span>
    </div>

    <q-infinite-scroll
      v-else
      :offset="250"
      @load="loadMore"
    >
      <q-table
        flat
        bordered
        :rows="parcelas"
        :columns="columns"
        row-key="id"
        :hide-bottom="parcelas.length > 0"
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

        <template #body-cell-vencimento="props">
          <q-td :props="props">
            <span
              class="text-weight-medium"
              :class="
                props.row.situacao === SituacaoParcelaEnum.ATRASADA
                  ? 'text-negative'
                  : 'text-grey-9'
              "
            >
              {{ formatarData(props.row.vencimento) }}
            </span>
          </q-td>
        </template>

        <template #body-cell-cliente="props">
          <q-td :props="props">
            <span class="text-grey-9">
              {{ props.row.honorario?.cliente?.nome ?? '-' }}
            </span>
          </q-td>
        </template>

        <template #body-cell-honorario="props">
          <q-td :props="props">
            <div class="column">
              <span
                class="text-primary cursor-pointer"
                @click="irParaHonorario(props.row.honorarioId)"
              >
                {{ props.row.honorario?.descricao }}
              </span>
              <span class="text-caption text-grey-6">
                Parcela {{ props.row.numero }}
              </span>
            </div>
          </q-td>
        </template>

        <template #body-cell-valor="props">
          <q-td :props="props">
            <span class="text-weight-medium text-grey-9">
              {{ formatarMoeda(props.row.valor) }}
            </span>
          </q-td>
        </template>

        <template #body-cell-situacao="props">
          <q-td :props="props">
            <SituacaoParcelaBadge :situacao="props.row.situacao" />
          </q-td>
        </template>

        <template #body-cell-pagamento="props">
          <q-td :props="props">
            <div
              v-if="props.row.situacao === SituacaoParcelaEnum.PAGA"
              class="column"
            >
              <span class="text-grey-9">
                {{ formatarMoeda(props.row.valorPago) }}
              </span>
              <span class="text-caption text-grey-6">
                {{ formatarData(props.row.dataPagamento) }} ·
                {{ getFormaPagamentoSettings(props.row.formaPagamento)?.label ?? 'Não informada' }}
              </span>
            </div>
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
                v-if="isEmAberto(props.row)"
                flat
                round
                dense
                size="sm"
                icon="price_check"
                color="positive"
                @click="abrirPagamento(props.row)"
              >
                <q-tooltip>Registrar pagamento</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.situacao === SituacaoParcelaEnum.PAGA"
                flat
                round
                dense
                size="sm"
                icon="undo"
                color="grey-7"
                @click="acoesParcela.estornar(props.row)"
              >
                <q-tooltip>Estornar pagamento</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="open_in_new"
                color="grey-6"
                @click="irParaHonorario(props.row.honorarioId)"
              >
                <q-tooltip>Ver honorário</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column items-center q-pa-xl text-grey-5">
            <q-icon
              name="request_quote"
              size="4em"
            />
            <p class="q-mt-md text-body2 text-center">
              Nenhuma parcela encontrada.<br />Cadastre um honorário para
              acompanhar o que o escritório tem a receber.
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
    v-model="dialogHonorario"
    :clientes="clienteOptions"
    :processos="processos"
    @saved="onAlterado"
  />

  <PagamentoDialog
    v-model="dialogPagamento"
    :parcela="parcelaSelecionada"
    @saved="onAlterado"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { debounce, type QTableColumn } from 'quasar'
import {
  useClienteService,
  useFinanceiroService,
  useProcessoService,
} from '@/services'
import { useAcoesParcela } from '@/composables/useAcoesParcela'
import {
  FiltroSituacaoParcelaEnum,
  FiltroSituacaoParcelaSettings,
  SituacaoParcelaEnum,
  getFormaPagamentoSettings,
  type DashboardFinanceiro,
  type ParcelaHonorario,
} from '@/types/financeiro/Honorario'
import type { Cliente } from '@/types/clientes/Cliente'
import type { Processo } from '@/types/processos/Processo'
import HonorarioFormDialog from '@/components/financeiro/HonorarioFormDialog.vue'
import PagamentoDialog from '@/components/financeiro/PagamentoDialog.vue'
import SituacaoParcelaBadge from '@/components/financeiro/SituacaoParcelaBadge.vue'
import ValorCard from '@/components/financeiro/ValorCard.vue'
import { formatarData } from '@/utils/date'
import { formatarMoeda } from '@/utils/financeiro'

const router = useRouter()
const financeiroService = useFinanceiroService()
const clienteService = useClienteService()
const processoService = useProcessoService()

const parcelas = ref<ParcelaHonorario[]>([])
const clientes = ref<Cliente[]>([])
const processos = ref<Processo[]>([])
const dashboard = ref<DashboardFinanceiro>({
  emAberto: 0,
  emAtraso: 0,
  quantidadeEmAtraso: 0,
  aVencer30Dias: 0,
  recebidoNoMes: 0,
})

const isLoading = ref(true)
const more = ref(false)
const page = ref(1)
const rpp = 20

const dialogHonorario = ref(false)
const dialogPagamento = ref(false)
const parcelaSelecionada = ref<ParcelaHonorario | null>(null)

const situacaoOptions = Object.values(FiltroSituacaoParcelaSettings)

const filters = reactive({
  term: '',
  situacao: FiltroSituacaoParcelaEnum.EM_ABERTO as FiltroSituacaoParcelaEnum | null,
  clienteId: null as string | null,
})

const acoesParcela = useAcoesParcela(onAlterado)

const clienteOptions = computed(() =>
  clientes.value.map((cliente) => ({ label: cliente.nome, value: cliente.id })),
)

const cards = computed(() => [
  {
    label: 'Em aberto',
    valor: formatarMoeda(dashboard.value.emAberto),
    color: 'blue-1',
    textColor: 'primary',
    icon: 'account_balance_wallet',
  },
  {
    label: 'Em atraso',
    valor: formatarMoeda(dashboard.value.emAtraso),
    color: 'red-1',
    textColor: 'negative',
    icon: 'error_outline',
    legenda: `${dashboard.value.quantidadeEmAtraso} parcela(s)`,
  },
  {
    label: 'A vencer em 30 dias',
    valor: formatarMoeda(dashboard.value.aVencer30Dias),
    color: 'amber-1',
    textColor: 'amber-9',
    icon: 'schedule',
  },
  {
    label: 'Recebido no mês',
    valor: formatarMoeda(dashboard.value.recebidoNoMes),
    color: 'green-1',
    textColor: 'positive',
    icon: 'savings',
  },
])

const columns: QTableColumn[] = [
  { name: 'vencimento', field: 'vencimento', label: 'Vencimento', align: 'left' },
  { name: 'cliente', field: 'honorario', label: 'Cliente', align: 'left' },
  { name: 'honorario', field: 'honorario', label: 'Honorário', align: 'left' },
  { name: 'valor', field: 'valor', label: 'Valor', align: 'right' },
  { name: 'situacao', field: 'situacao', label: 'Situação', align: 'left' },
  { name: 'pagamento', field: 'dataPagamento', label: 'Pagamento', align: 'left' },
  { name: 'acoes', field: 'id', label: '', align: 'right' },
]

function isEmAberto(parcela: ParcelaHonorario): boolean {
  return (
    parcela.situacao === SituacaoParcelaEnum.A_VENCER ||
    parcela.situacao === SituacaoParcelaEnum.ATRASADA
  )
}

function activeFilters() {
  return {
    ...(filters.term?.trim() && { term: filters.term.trim() }),
    ...(filters.situacao && { situacao: filters.situacao }),
    ...(filters.clienteId && { clienteId: filters.clienteId }),
  }
}

let versaoDaLista = 0

async function load() {
  versaoDaLista += 1
  const versao = versaoDaLista

  isLoading.value = true
  try {
    const response = await financeiroService.getParcelas({
      page: 1,
      rpp,
      ...activeFilters(),
    })
    if (versao !== versaoDaLista) return

    parcelas.value = response.list
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
    const response = await financeiroService.getParcelas({
      page: proximaPagina,
      rpp,
      ...activeFilters(),
    })
    if (versao !== versaoDaLista) return done()

    parcelas.value = parcelas.value.concat(response.list)
    page.value = proximaPagina
    more.value = response.more
    done()
  } catch (error) {
    console.error(error)
    done(true)
  }
}

async function carregarDashboard() {
  try {
    dashboard.value = await financeiroService.getDashboard()
  } catch (error) {
    console.error(error)
  }
}

function refresh() {
  page.value = 1
  load()
}

function onAlterado() {
  refresh()
  carregarDashboard()
}

function abrirPagamento(parcela: ParcelaHonorario) {
  parcelaSelecionada.value = parcela
  dialogPagamento.value = true
}

function irParaHonorario(honorarioId: string) {
  router.push({ name: 'financeiro-honorario-view', params: { id: honorarioId } })
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

  await Promise.all([load(), carregarDashboard()])
})
</script>

<style scoped>
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
</style>

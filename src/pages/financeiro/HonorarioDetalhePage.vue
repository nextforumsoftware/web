<template>
  <q-page
    padding
    class="column gap-md container"
  >
    <div>
      <q-btn
        flat
        dense
        no-caps
        icon="arrow_back"
        color="grey-7"
        label="Honorários"
        :to="{ name: 'financeiro-honorarios' }"
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
      <span class="text-grey-8">Carregando honorário...</span>
    </div>

    <template v-else-if="honorario">
      <div class="bg-white q-pa-lg cabecalho column gap-sm">
        <div class="row items-start justify-between gap-md">
          <div class="column gap-xs">
            <div class="row items-center gap-sm">
              <h5 class="text-terciary text-bold q-my-none">
                {{ honorario.descricao }}
              </h5>
              <q-badge
                rounded
    class="q-px-sm q-py-xs text-weight-bold"
                :color="tipoSettings?.color"
                :text-color="tipoSettings?.textColor"
                :label="tipoSettings?.label"
              />
            </div>
            <span class="text-grey-8">
              {{ honorario.cliente?.nome }}
              <template v-if="honorario.processo">
                ·
                <router-link
                  class="text-primary"
                  :to="{
                    name: 'processo-view',
                    params: { id: honorario.processo.id },
                  }"
                >
                  {{ honorario.processo.numeroProcesso }}
                </router-link>
              </template>
            </span>
            <span
              v-if="honorario.percentualExito"
              class="text-caption text-grey-7"
            >
              Êxito de {{ honorario.percentualExito }}%
            </span>
          </div>

          <div class="row gap-sm">
            <q-btn
              outline
              no-caps
              color="primary"
              icon="edit"
              label="Editar"
              @click="dialogHonorario = true"
            />
            <q-btn
              flat
              no-caps
              color="negative"
              icon="delete_outline"
              label="Excluir"
              @click="confirmarExclusao"
            />
          </div>
        </div>

        <p
          v-if="honorario.observacoes"
          class="text-grey-8 q-mb-none observacoes"
        >
          {{ honorario.observacoes }}
        </p>
      </div>

      <div class="cards-grid">
        <ValorCard
          v-for="card in cards"
          :key="card.label"
          v-bind="card"
        />
      </div>

      <div class="bg-white q-pa-lg cabecalho column gap-md">
        <div class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-bold text-grey-9">Parcelas</div>
          <q-btn
            unelevated
            no-caps
            color="secondary"
            icon="add"
            label="Nova parcela"
            @click="abrirParcela()"
          />
        </div>

        <q-table
          flat
          bordered
          :rows="honorario.parcelas"
          :columns="columns"
          row-key="id"
          hide-bottom
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
              <div
                v-if="props.row.observacoes"
                class="text-caption text-grey-6"
              >
                {{ props.row.observacoes }}
              </div>
            </q-td>
          </template>

          <template #body-cell-valor="props">
            <q-td :props="props">
              <span
                class="text-weight-medium"
                :class="
                  props.row.situacao === SituacaoParcelaEnum.CANCELADA
                    ? 'text-grey-5 text-strike'
                    : 'text-grey-9'
                "
              >
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
                  v-if="props.row.situacao !== SituacaoParcelaEnum.PAGA"
                  flat
                  round
                  dense
                  size="sm"
                  icon="edit"
                  color="grey-6"
                  @click="abrirParcela(props.row)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="isEmAberto(props.row)"
                  flat
                  round
                  dense
                  size="sm"
                  icon="block"
                  color="grey-6"
                  @click="acoesParcela.cancelar(props.row)"
                >
                  <q-tooltip>Cancelar parcela</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.situacao === SituacaoParcelaEnum.CANCELADA"
                  flat
                  round
                  dense
                  size="sm"
                  icon="replay"
                  color="grey-6"
                  @click="acoesParcela.reativar(props.row)"
                >
                  <q-tooltip>Reativar parcela</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="props.row.situacao !== SituacaoParcelaEnum.PAGA"
                  flat
                  round
                  dense
                  size="sm"
                  icon="delete_outline"
                  color="negative"
                  @click="acoesParcela.excluir(props.row)"
                >
                  <q-tooltip>Excluir</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template #no-data>
            <div class="full-width column items-center q-pa-lg text-grey-5">
              <p class="q-my-none text-body2">Nenhuma parcela cadastrada.</p>
            </div>
          </template>
        </q-table>
      </div>
    </template>
  </q-page>

  <HonorarioFormDialog
    v-model="dialogHonorario"
    :honorario="honorario"
    :clientes="clienteOptions"
    :processos="processos"
    @saved="carregarHonorario"
  />

  <ParcelaFormDialog
    v-model="dialogParcela"
    :honorario-id="honorarioId"
    :parcela="parcelaSelecionada"
    @saved="carregarHonorario"
  />

  <PagamentoDialog
    v-model="dialogPagamento"
    :parcela="parcelaSelecionada"
    @saved="carregarHonorario"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar, type QTableColumn } from 'quasar'
import {
  useClienteService,
  useFinanceiroService,
  useProcessoService,
} from '@/services'
import { useNotification } from '@/composables/useNotification'
import { useAcoesParcela } from '@/composables/useAcoesParcela'
import {
  SituacaoParcelaEnum,
  getFormaPagamentoSettings,
  getTipoHonorarioSettings,
  type Honorario,
  type ParcelaHonorario,
} from '@/types/financeiro/Honorario'
import type { Cliente } from '@/types/clientes/Cliente'
import type { Processo } from '@/types/processos/Processo'
import HonorarioFormDialog from '@/components/financeiro/HonorarioFormDialog.vue'
import PagamentoDialog from '@/components/financeiro/PagamentoDialog.vue'
import ParcelaFormDialog from '@/components/financeiro/ParcelaFormDialog.vue'
import SituacaoParcelaBadge from '@/components/financeiro/SituacaoParcelaBadge.vue'
import ValorCard from '@/components/financeiro/ValorCard.vue'
import { formatarData } from '@/utils/date'
import { formatarMoeda } from '@/utils/financeiro'
import { getApiErrorMessage } from '@/utils/apiError'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const financeiroService = useFinanceiroService()
const clienteService = useClienteService()
const processoService = useProcessoService()
const notification = useNotification()

const honorarioId = String(route.params.id)

const honorario = ref<Honorario | null>(null)
const clientes = ref<Cliente[]>([])
const processos = ref<Processo[]>([])

const isLoading = ref(true)
const dialogHonorario = ref(false)
const dialogParcela = ref(false)
const dialogPagamento = ref(false)
const parcelaSelecionada = ref<ParcelaHonorario | null>(null)

const acoesParcela = useAcoesParcela(carregarHonorario)

const tipoSettings = computed(() =>
  honorario.value ? getTipoHonorarioSettings(honorario.value.tipo) : undefined,
)

const clienteOptions = computed(() =>
  clientes.value.map((cliente) => ({ label: cliente.nome, value: cliente.id })),
)

const cards = computed(() => {
  const resumo = honorario.value?.resumo

  return [
    {
      label: 'Total',
      valor: formatarMoeda(resumo?.valorTotal),
      color: 'blue-1',
      textColor: 'primary',
      icon: 'receipt_long',
      legenda: `${resumo?.quantidadeParcelas ?? 0} parcela(s)`,
    },
    {
      label: 'Recebido',
      valor: formatarMoeda(resumo?.valorRecebido),
      color: 'green-1',
      textColor: 'positive',
      icon: 'savings',
      legenda: `${resumo?.quantidadePagas ?? 0} paga(s)`,
    },
    {
      label: 'Em aberto',
      valor: formatarMoeda(resumo?.valorEmAberto),
      color: 'amber-1',
      textColor: 'amber-9',
      icon: 'account_balance_wallet',
    },
    {
      label: 'Em atraso',
      valor: formatarMoeda(resumo?.valorEmAtraso),
      color: 'red-1',
      textColor: 'negative',
      icon: 'error_outline',
      legenda: `${resumo?.quantidadeAtrasadas ?? 0} parcela(s)`,
    },
  ]
})

const columns: QTableColumn[] = [
  { name: 'numero', field: 'numero', label: 'Nº', align: 'left' },
  { name: 'vencimento', field: 'vencimento', label: 'Vencimento', align: 'left' },
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

async function carregarHonorario() {
  try {
    honorario.value = await financeiroService.getHonorario(honorarioId)
  } catch (error) {
    notification.error(getApiErrorMessage(error, 'Erro ao carregar honorário.'))
  }
}

function abrirParcela(parcela?: ParcelaHonorario) {
  parcelaSelecionada.value = parcela ?? null
  dialogParcela.value = true
}

function abrirPagamento(parcela: ParcelaHonorario) {
  if (!honorario.value) return

  const { id, descricao, tipo, cliente, processo } = honorario.value
  parcelaSelecionada.value = {
    ...parcela,
    honorario: { id, descricao, tipo, cliente, processo },
  }
  dialogPagamento.value = true
}

function confirmarExclusao() {
  if (!honorario.value) return

  $q.dialog({
    title: 'Excluir honorário',
    message: `"${honorario.value.descricao}" e todas as suas parcelas serão removidos permanentemente.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Excluir', color: 'negative', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await financeiroService.removeHonorario(honorarioId)
      notification.success('Honorário excluído.')
      router.push({ name: 'financeiro-honorarios' })
    } catch (error) {
      notification.error(getApiErrorMessage(error, 'Erro ao excluir honorário.'))
    }
  })
}

onMounted(async () => {
  isLoading.value = true
  try {
    const [clientesResponse, processosResponse] = await Promise.all([
      clienteService.getAll({ page: 1, rpp: 200 }),
      processoService.getAll({ page: 1, rpp: 200 }),
      carregarHonorario(),
    ])
    clientes.value = clientesResponse.list
    processos.value = processosResponse.list
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.cabecalho {
  border: 0.4px solid gray;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.observacoes {
  white-space: pre-line;
}
</style>

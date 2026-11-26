<template>
  <q-dialog
    v-model="isAberto"
    persistent
  >
    <q-card style="width: 480px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Registrar pagamento</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>

      <q-card-section
        v-if="parcela"
        class="column gap-md"
      >
        <div class="column gap-xs bg-grey-2 rounded-borders q-pa-md text-body2">
          <span class="text-weight-medium text-grey-9">
            {{ parcela.honorario?.cliente?.nome }}
          </span>
          <span class="text-grey-7">
            {{ parcela.honorario?.descricao }} · Parcela {{ parcela.numero }}
          </span>
          <span class="text-grey-7">
            Vencimento {{ formatarData(parcela.vencimento) }} ·
            <strong class="text-grey-9">{{ formatarMoeda(parcela.valor) }}</strong>
          </span>
        </div>

        <q-form
          ref="formRef"
          class="column gap-md"
          @submit.prevent="salvar"
        >
          <div class="row gap-md">
            <div class="col">
              <InputDateComponent
                v-model="form.dataPagamento"
                label="Data do pagamento *"
                outlined
                dense
                :rules="[(value) => !!value || 'Data é obrigatória']"
              />
            </div>
            <div class="col">
              <InputMoneyComponent
                v-model="form.valorPago"
                label="Valor recebido *"
                outlined
                dense
                :rules="[(value) => Number(value) > 0 || 'Informe o valor']"
              />
            </div>
          </div>

          <div
            v-if="saldoRestante > 0"
            class="row items-center no-wrap gap-sm bg-amber-1 text-amber-10 text-body2 rounded-borders q-pa-sm"
          >
            <q-icon
              name="info"
              size="18px"
            />
            O saldo de {{ formatarMoeda(saldoRestante) }} vira uma nova parcela
            em aberto, com o mesmo vencimento.
          </div>

          <SelectComponent
            v-model="form.formaPagamento"
            label="Forma de pagamento"
            :options="formaPagamentoOptions"
            clearable
          />

          <div class="row justify-end gap-sm">
            <q-btn
              flat
              no-caps
              label="Cancelar"
              v-close-popup
            />
            <q-btn
              unelevated
              color="positive"
              no-caps
              icon="check"
              label="Confirmar pagamento"
              type="submit"
              :loading="isLoading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type QForm } from 'quasar'
import { useFinanceiroService } from '@/services'
import { useNotification } from '@/composables/useNotification'
import {
  FormaPagamentoEnum,
  FormaPagamentoSettings,
  type ParcelaHonorario,
} from '@/types/financeiro/Honorario'
import InputDateComponent from '@/components/InputDateComponent.vue'
import InputMoneyComponent from '@/components/InputMoneyComponent.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import { formatarMoeda, paraValorDoInput, todayIso } from '@/utils/financeiro'
import { brToIso, formatarData, isoToBr } from '@/utils/date'
import { getApiErrorMessage } from '@/utils/apiError'

type PagamentoForm = {
  dataPagamento: string
  valorPago: string
  formaPagamento: FormaPagamentoEnum | null
}

const isAberto = defineModel<boolean>({ required: true })

const props = defineProps<{
  parcela: ParcelaHonorario | null
}>()

const emit = defineEmits<{
  (e: 'saved', parcela: ParcelaHonorario): void
}>()

const financeiroService = useFinanceiroService()
const notification = useNotification()

const formaPagamentoOptions = Object.values(FormaPagamentoSettings)

const formRef = ref<InstanceType<typeof QForm> | null>(null)
const isLoading = ref(false)

const form = ref<PagamentoForm>({
  dataPagamento: '',
  valorPago: '0.00',
  formaPagamento: FormaPagamentoEnum.PIX,
})

const saldoRestante = computed(() => {
  if (!props.parcela) return 0

  const valorDaParcelaEmCentavos = Math.round(props.parcela.valor * 100)
  const valorPagoEmCentavos = Math.round(Number(form.value.valorPago) * 100)
  if (!(valorPagoEmCentavos > 0)) return 0

  return Math.max(valorDaParcelaEmCentavos - valorPagoEmCentavos, 0) / 100
})

watch(isAberto, (isAbrindo) => {
  if (!isAbrindo || !props.parcela) return
  form.value = {
    dataPagamento: isoToBr(todayIso()),
    valorPago: paraValorDoInput(props.parcela.valor),
    formaPagamento: FormaPagamentoEnum.PIX,
  }
})

async function salvar() {
  if (!formRef.value || !props.parcela) return
  if (!(await formRef.value.validate())) return

  isLoading.value = true
  try {
    const payload = {
      dataPagamento: brToIso(form.value.dataPagamento),
      valorPago: Number(form.value.valorPago),
      formaPagamento: form.value.formaPagamento,
    }

    const parcelaPaga = await financeiroService.registrarPagamento(
      props.parcela.id,
      payload,
    )

    notification.success('Pagamento registrado!')
    emit('saved', parcelaPaga)
    isAberto.value = false
  } catch (error) {
    notification.error(getApiErrorMessage(error, 'Erro ao registrar pagamento.'))
  } finally {
    isLoading.value = false
  }
}
</script>

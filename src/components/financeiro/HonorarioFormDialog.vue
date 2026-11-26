<template>
  <q-dialog
    v-model="isAberto"
    persistent
  >
    <q-card style="width: 640px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ honorario ? 'Editar honorário' : 'Novo honorário' }}
        </div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>

      <q-card-section>
        <q-form
          ref="formRef"
          class="column gap-md"
          @submit.prevent="salvar"
        >
          <SelectComponent
            :model-value="form.clienteId"
            label="Cliente *"
            :options="clientes"
            :rules="[(value) => !!value || 'Cliente é obrigatório']"
            @update:model-value="onClienteAlterado"
          />

          <SelectComponent
            v-model="form.processoId"
            label="Processo"
            :options="processosDoCliente"
            :hint="form.clienteId ? '' : 'Selecione o cliente primeiro'"
            clearable
          />

          <InputTextComponent
            v-model="form.descricao"
            label="Descrição *"
            outlined
            dense
            :rules="[(value) => !!value || 'Descrição é obrigatória']"
          />

          <div class="row gap-md">
            <div class="col">
              <SelectComponent
                v-model="form.tipo"
                label="Tipo *"
                :options="tipoOptions"
                :rules="[(value) => !!value || 'Tipo é obrigatório']"
              />
            </div>
            <div
              v-if="form.tipo === TipoHonorarioEnum.EXITO"
              class="col"
            >
              <InputTextComponent
                v-model="form.percentualExito"
                label="Percentual de êxito (%)"
                type="number"
                outlined
                dense
              />
            </div>
          </div>

          <template v-if="!honorario">
            <div class="row gap-md">
              <div class="col">
                <InputMoneyComponent
                  v-model="form.valorTotal"
                  label="Valor total *"
                  outlined
                  dense
                  :rules="[(value) => Number(value) > 0 || 'Informe o valor']"
                />
              </div>
              <div class="col">
                <InputTextComponent
                  v-model="form.numeroParcelas"
                  label="Parcelas *"
                  type="number"
                  outlined
                  dense
                  :rules="[
                    (value) =>
                      (Number(value) >= 1 && Number(value) <= 120) ||
                      'Entre 1 e 120',
                  ]"
                />
              </div>
              <div class="col">
                <InputDateComponent
                  v-model="form.primeiroVencimento"
                  label="1º vencimento *"
                  outlined
                  dense
                  :rules="[(value) => !!value || 'Data é obrigatória']"
                />
              </div>
            </div>

            <div
              v-if="previewParcelas"
              class="row items-center gap-sm bg-blue-1 text-primary text-body2 rounded-borders q-pa-sm"
            >
              <q-icon
                name="receipt_long"
                size="18px"
              />
              {{ previewParcelas }}
            </div>
          </template>

          <div
            v-else
            class="text-caption text-grey-7"
          >
            Valores e vencimentos são ajustados direto nas parcelas, no detalhe
            do honorário.
          </div>

          <InputTextComponent
            v-model="form.observacoes"
            label="Observações"
            type="textarea"
            outlined
            dense
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
              color="primary"
              no-caps
              :label="honorario ? 'Atualizar' : 'Salvar'"
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
  TipoHonorarioEnum,
  TipoHonorarioSettings,
  type Honorario,
  type NovoHonorarioPayload,
} from '@/types/financeiro/Honorario'
import type { Processo } from '@/types/processos/Processo'
import InputDateComponent from '@/components/InputDateComponent.vue'
import InputMoneyComponent from '@/components/InputMoneyComponent.vue'
import InputTextComponent from '@/components/InputTextComponent.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import { formatarMoeda } from '@/utils/financeiro'
import { brToIso } from '@/utils/date'
import { getApiErrorMessage } from '@/utils/apiError'

type HonorarioForm = {
  clienteId: string | null
  processoId: string | null
  descricao: string
  tipo: TipoHonorarioEnum
  percentualExito: string
  valorTotal: string
  numeroParcelas: string
  primeiroVencimento: string
  observacoes: string
}

type SelectOption = { label: string; value: string }

const isAberto = defineModel<boolean>({ required: true })

const props = defineProps<{
  honorario?: Honorario | null
  clientes: SelectOption[]
  processos: Processo[]
}>()

const emit = defineEmits<{
  (e: 'saved', honorario: Honorario): void
}>()

const financeiroService = useFinanceiroService()
const notification = useNotification()

const tipoOptions = Object.values(TipoHonorarioSettings)

const formRef = ref<InstanceType<typeof QForm> | null>(null)
const isLoading = ref(false)

function formVazio(): HonorarioForm {
  return {
    clienteId: null,
    processoId: null,
    descricao: '',
    tipo: TipoHonorarioEnum.CONTRATUAL,
    percentualExito: '',
    valorTotal: '0.00',
    numeroParcelas: '1',
    primeiroVencimento: '',
    observacoes: '',
  }
}

function formDoHonorario(honorario: Honorario): HonorarioForm {
  return {
    ...formVazio(),
    clienteId: honorario.clienteId,
    processoId: honorario.processoId ?? null,
    descricao: honorario.descricao,
    tipo: honorario.tipo,
    percentualExito:
      honorario.percentualExito != null ? String(honorario.percentualExito) : '',
    observacoes: honorario.observacoes ?? '',
  }
}

const form = ref<HonorarioForm>(formVazio())

const processosDoCliente = computed(() => {
  const opcoes = props.processos
    .filter((processo) => processo.clienteId === form.value.clienteId)
    .map((processo) => ({ label: processo.numeroProcesso, value: processo.id }))

  const processoAtual = props.honorario?.processo
  const isClienteOriginal = props.honorario?.clienteId === form.value.clienteId
  const hasProcessoAtual = opcoes.some((opcao) => opcao.value === processoAtual?.id)

  if (!processoAtual || !isClienteOriginal || hasProcessoAtual) return opcoes

  return [{ label: processoAtual.numeroProcesso, value: processoAtual.id }, ...opcoes]
})

const previewParcelas = computed(() => {
  const totalEmCentavos = Math.round(Number(form.value.valorTotal) * 100)
  const quantidade = Number(form.value.numeroParcelas)
  if (!(totalEmCentavos > 0) || !Number.isInteger(quantidade) || quantidade < 1) {
    return ''
  }

  if (quantidade === 1) {
    return `Parcela única de ${formatarMoeda(totalEmCentavos / 100)}`
  }

  const valorBase = Math.floor(totalEmCentavos / quantidade)
  const valorUltima = totalEmCentavos - valorBase * (quantidade - 1)
  const resumo = `${quantidade}x de ${formatarMoeda(valorBase / 100)}, com vencimento mensal`

  return valorUltima === valorBase
    ? resumo
    : `${resumo} (última de ${formatarMoeda(valorUltima / 100)})`
})

watch(isAberto, (isAbrindo) => {
  if (!isAbrindo) return
  form.value = props.honorario ? formDoHonorario(props.honorario) : formVazio()
})

function onClienteAlterado(clienteId: string | null) {
  if (clienteId === form.value.clienteId) return

  form.value.clienteId = clienteId
  form.value.processoId = null
}

function montarPayload(): NovoHonorarioPayload {
  const hasPercentualExito =
    form.value.tipo === TipoHonorarioEnum.EXITO && form.value.percentualExito !== ''
  const dadosHonorario: NovoHonorarioPayload = {
    clienteId: form.value.clienteId ?? '',
    processoId: form.value.processoId,
    descricao: form.value.descricao,
    tipo: form.value.tipo,
    percentualExito: hasPercentualExito ? Number(form.value.percentualExito) : null,
    observacoes: form.value.observacoes,
  }

  if (props.honorario) return dadosHonorario

  return {
    ...dadosHonorario,
    valorTotal: Number(form.value.valorTotal),
    numeroParcelas: Number(form.value.numeroParcelas),
    primeiroVencimento: brToIso(form.value.primeiroVencimento),
  }
}

async function salvar() {
  if (!formRef.value) return
  if (!(await formRef.value.validate())) return

  isLoading.value = true
  try {
    const payload = montarPayload()

    const salvo = props.honorario
      ? await financeiroService.updateHonorario(props.honorario.id, payload)
      : await financeiroService.createHonorario(payload)

    notification.success(
      props.honorario ? 'Honorário atualizado!' : 'Honorário cadastrado!',
    )
    emit('saved', salvo)
    isAberto.value = false
  } catch (error) {
    notification.error(getApiErrorMessage(error, 'Erro ao salvar honorário.'))
  } finally {
    isLoading.value = false
  }
}
</script>

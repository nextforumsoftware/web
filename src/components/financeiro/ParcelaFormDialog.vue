<template>
  <q-dialog
    v-model="isAberto"
    persistent
  >
    <q-card style="width: 480px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ parcela ? `Editar parcela ${parcela.numero}` : 'Nova parcela' }}
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
          <div class="row gap-md">
            <div class="col">
              <InputMoneyComponent
                v-model="form.valor"
                label="Valor *"
                outlined
                dense
                :rules="[(value) => Number(value) > 0 || 'Informe o valor']"
              />
            </div>
            <div class="col">
              <InputDateComponent
                v-model="form.vencimento"
                label="Vencimento *"
                outlined
                dense
                :rules="[(value) => !!value || 'Data é obrigatória']"
              />
            </div>
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
              :label="parcela ? 'Atualizar' : 'Salvar'"
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
import { ref, watch } from 'vue'
import { type QForm } from 'quasar'
import { useFinanceiroService } from '@/services'
import { useNotification } from '@/composables/useNotification'
import type { ParcelaHonorario } from '@/types/financeiro/Honorario'
import InputDateComponent from '@/components/InputDateComponent.vue'
import InputMoneyComponent from '@/components/InputMoneyComponent.vue'
import InputTextComponent from '@/components/InputTextComponent.vue'
import { paraValorDoInput } from '@/utils/financeiro'
import { brToIso, isoToBr } from '@/utils/date'
import { getApiErrorMessage } from '@/utils/apiError'

type ParcelaForm = {
  valor: string
  vencimento: string
  observacoes: string
}

const isAberto = defineModel<boolean>({ required: true })

const props = defineProps<{
  honorarioId: string
  parcela?: ParcelaHonorario | null
}>()

const emit = defineEmits<{
  (e: 'saved', parcela: ParcelaHonorario): void
}>()

const financeiroService = useFinanceiroService()
const notification = useNotification()

const formRef = ref<InstanceType<typeof QForm> | null>(null)
const isLoading = ref(false)

const form = ref<ParcelaForm>({ valor: '0.00', vencimento: '', observacoes: '' })

watch(isAberto, (isAbrindo) => {
  if (!isAbrindo) return
  form.value = {
    valor: paraValorDoInput(props.parcela?.valor),
    vencimento: isoToBr(props.parcela?.vencimento),
    observacoes: props.parcela?.observacoes ?? '',
  }
})

async function salvar() {
  if (!formRef.value) return
  if (!(await formRef.value.validate())) return

  isLoading.value = true
  try {
    const payload = {
      valor: Number(form.value.valor),
      vencimento: brToIso(form.value.vencimento),
      observacoes: form.value.observacoes,
    }

    const salva = props.parcela
      ? await financeiroService.updateParcela(props.parcela.id, payload)
      : await financeiroService.createParcela(props.honorarioId, payload)

    notification.success(props.parcela ? 'Parcela atualizada!' : 'Parcela cadastrada!')
    emit('saved', salva)
    isAberto.value = false
  } catch (error) {
    notification.error(getApiErrorMessage(error, 'Erro ao salvar parcela.'))
  } finally {
    isLoading.value = false
  }
}
</script>

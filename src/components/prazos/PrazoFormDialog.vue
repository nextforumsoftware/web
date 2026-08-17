<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <q-card style="min-width: 500px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ prazo ? 'Editar Prazo' : 'Novo Prazo' }}</div>
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
          @submit.prevent="salvar"
        >
          <div class="row q-col-gutter-md">
            <div
              v-if="!processoIdFixo"
              class="col-12"
            >
              <SelectComponent
                v-model="form.processoId"
                label="Processo *"
                :options="processos"
                :rules="[(value) => !!value || 'Processo é obrigatório']"
              />
            </div>

            <div class="col-12">
              <InputTextComponent
                v-model="form.titulo"
                label="Título *"
                outlined
                dense
                :rules="[(value) => !!value || 'Título é obrigatório']"
              />
            </div>

            <div class="col-6">
              <SelectComponent
                v-model="form.tipo"
                label="Tipo *"
                :options="TIPOS_PRAZO"
                :rules="[(value) => !!value || 'Tipo é obrigatório']"
              />
            </div>

            <div class="col-6">
              <InputDateComponent
                v-model="form.data"
                label="Data *"
                outlined
                dense
                :rules="[(value) => !!value || 'Data é obrigatória']"
              />
            </div>

            <div class="col-6">
              <SelectComponent
                v-model="form.responsavelId"
                label="Responsável"
                :options="usuarios"
                clearable
              />
            </div>

            <div
              v-if="prazo"
              class="col-6"
            >
              <SelectComponent
                v-model="form.status"
                label="Status"
                :options="STATUS_PRAZO"
              />
            </div>

            <div class="col-12">
              <InputTextComponent
                v-model="form.observacoes"
                label="Observações"
                type="textarea"
                outlined
                dense
              />
            </div>
          </div>

          <div class="row justify-end q-mt-md q-gutter-sm">
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
              :label="prazo ? 'Atualizar' : 'Salvar'"
              type="submit"
              :loading="isSaving"
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
import { usePrazoService } from '@/services'
import { useNotification } from '@/composables/useNotification'
import type { Prazo, StatusPrazo, TipoPrazo } from '@/types/prazos/Prazo'
import InputDateComponent from '@/components/InputDateComponent.vue'
import InputTextComponent from '@/components/InputTextComponent.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import { TIPOS_PRAZO, STATUS_PRAZO } from '@/utils/prazo'
import { brToIso, isoToBr } from '@/utils/date'

type PrazoForm = {
  processoId: string
  titulo: string
  tipo: TipoPrazo
  data: string
  responsavelId: string | null
  status: StatusPrazo
  observacoes: string
}

type SelectOption = { label: string; value: string }

const props = defineProps<{
  modelValue: boolean
  prazo?: Prazo | null
  processos: SelectOption[]
  usuarios: SelectOption[]
  processoIdFixo?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', prazo: Prazo): void
}>()

const prazoService = usePrazoService()
const notification = useNotification()

const formRef = ref<InstanceType<typeof QForm> | null>(null)
const isSaving = ref(false)

function formVazio(): PrazoForm {
  return {
    processoId: props.processoIdFixo ?? '',
    titulo: '',
    tipo: 'OUTROS',
    data: '',
    responsavelId: null,
    status: 'PENDENTE',
    observacoes: '',
  }
}

function formDoPrazo(prazo: Prazo): PrazoForm {
  return {
    processoId: prazo.processoId,
    titulo: prazo.titulo,
    tipo: prazo.tipo,
    data: isoToBr(prazo.data),
    responsavelId: prazo.responsavelId ?? null,
    status: prazo.status,
    observacoes: prazo.observacoes ?? '',
  }
}

const form = ref<PrazoForm>(formVazio())

watch(
  () => props.modelValue,
  (aberto) => {
    if (!aberto) return
    form.value = props.prazo ? formDoPrazo(props.prazo) : formVazio()
  },
)

async function salvar() {
  if (!formRef.value) return
  if (!(await formRef.value.validate())) return

  isSaving.value = true
  try {
    const payload = { ...form.value, data: brToIso(form.value.data) }

    const salvo = props.prazo
      ? await prazoService.update(props.prazo.id, payload)
      : await prazoService.create(payload)

    notification.success(
      props.prazo ? 'Prazo atualizado!' : 'Prazo cadastrado!',
    )
    emit('saved', salvo)
    emit('update:modelValue', false)
  } catch {
    notification.error('Erro ao salvar prazo.')
  } finally {
    isSaving.value = false
  }
}
</script>

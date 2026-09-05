<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card style="min-width: 500px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ titulo }}</div>
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
        v-if="sugestao"
        class="q-pb-none"
      >
        <q-banner
          dense
          class="bg-blue-1 text-grey-8 rounded-borders"
        >
          <template #avatar>
            <q-icon
              name="gavel"
              color="primary"
            />
          </template>
          <span class="text-caption">
            Baseado na movimentação do tribunal. Reescreva o título e o
            comentário na linguagem do cliente.
          </span>
        </q-banner>
      </q-card-section>

      <q-card-section>
        <q-form
          ref="formRef"
          @submit.prevent="salvar"
        >
          <div class="row q-col-gutter-md">
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
                :options="TIPOS_EVENTO"
                option-value="value"
                option-label="label"
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

            <div class="col-12">
              <InputTextComponent
                v-model="form.descricao"
                label="Comentário / Andamento"
                type="textarea"
                outlined
                dense
              />
            </div>
          </div>

          <div class="row justify-end q-mt-md gap-sm">
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
              :label="evento ? 'Atualizar' : 'Salvar'"
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
import { computed, ref, watch } from 'vue'
import { type QForm } from 'quasar'
import { useTimelineService } from '@/services'
import { useNotification } from '@/composables/useNotification'
import type {
  EventoSugerido,
  TimelineEvento,
  TipoEvento,
} from '@/types/timelines/TimelineEvento'
import InputDateComponent from '@/components/InputDateComponent.vue'
import InputTextComponent from '@/components/InputTextComponent.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import { TIPOS_EVENTO } from '@/utils/timeline'
import { brToIso, isoToBr } from '@/utils/date'
import { getApiErrorMessage } from '@/utils/apiError'

type EventoForm = {
  titulo: string
  tipo: TipoEvento
  data: string
  descricao: string
  movimentoId: string | null
}

const props = defineProps<{
  modelValue: boolean
  processoId: string
  evento?: TimelineEvento | null
  sugestao?: EventoSugerido | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', evento: TimelineEvento): void
}>()

const timelineService = useTimelineService()
const notification = useNotification()

const formRef = ref<InstanceType<typeof QForm> | null>(null)
const isSaving = ref(false)

const titulo = computed(() => {
  if (props.evento) return 'Editar Evento'
  if (props.sugestao) return 'Adicionar à timeline'
  return 'Novo Evento'
})

function formVazio(): EventoForm {
  return {
    titulo: '',
    tipo: 'OUTROS',
    data: '',
    descricao: '',
    movimentoId: null,
  }
}

function formDoEvento(evento: TimelineEvento): EventoForm {
  return {
    titulo: evento.titulo,
    tipo: evento.tipo,
    data: isoToBr(evento.data),
    descricao: evento.descricao ?? '',
    movimentoId: evento.movimentoId ?? null,
  }
}

function formDaSugestao(sugestao: EventoSugerido): EventoForm {
  return {
    titulo: sugestao.titulo,
    tipo: sugestao.tipo,
    data: sugestao.data,
    descricao: '',
    movimentoId: sugestao.movimentoId,
  }
}

const form = ref<EventoForm>(formVazio())

watch(
  () => props.modelValue,
  (aberto) => {
    if (!aberto) return

    if (props.evento) {
      form.value = formDoEvento(props.evento)
      return
    }

    form.value = props.sugestao ? formDaSugestao(props.sugestao) : formVazio()
  },
)

async function salvar() {
  if (!formRef.value) return
  if (!(await formRef.value.validate())) return

  isSaving.value = true
  try {
    const payload = { ...form.value, data: brToIso(form.value.data) }

    const salvo = props.evento
      ? await timelineService.update(props.evento.id, payload)
      : await timelineService.create(props.processoId, payload)

    notification.success(
      props.evento ? 'Evento atualizado!' : 'Evento adicionado!',
    )
    emit('saved', salvo)
    emit('update:modelValue', false)
  } catch (error) {
    notification.error(getApiErrorMessage(error, 'Erro ao salvar evento.'))
  } finally {
    isSaving.value = false
  }
}
</script>

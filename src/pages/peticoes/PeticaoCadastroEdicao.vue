<template>
  <div class="q-pa-md">
    <div
      class="flex justify-between items-center q-mb-sm"
      style="height: 80px"
    >
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">
          {{ editMode ? 'Editar Modelo de Petição' : 'Novo Modelo de Petição' }}
        </h4>
        <p
          class="text-terciary q-my-none"
          v-html="
            editMode
              ? `Altere o conteúdo do modelo <span class='text-primary text-bold'>${formData?.nome}</span>`
              : 'Crie um novo modelo de petição para reutilizar'
          "
        />
      </div>
      <q-btn
        color="green"
        size="small"
        no-caps
        :label="editMode ? 'Atualizar' : 'Salvar modelo'"
        @click="handleSubmit()"
        :loading="isLoading"
        :disable="loading"
      />
    </div>

    <div
      class="bg-white q-pa-lg"
      style="border: 0.4px solid gray; position: relative;"
    >
      <div v-if="loading" class="page-block-overlay" />
      <q-form
        ref="formRef"
        @submit.prevent="handleSubmit"
      >
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <InputTextComponent
              v-model="formData.nome"
              label="Nome do modelo"
              dense
              outlined
              :rules="[(val) => requiredField(val, 'Nome do modelo')]"
            />
          </div>

          <div class="col-12 col-md-6">
            <SelectComponent
              v-model="formData.tipo"
              label="Tipo"
              :options="tiposPeticao"
              option-value="value"
              option-label="title"
              :rules="[(val) => requiredField(val, 'Tipo')]"
            />
          </div>

          <div class="col-12">
            <div
              class="column"
              style="gap: 6px"
            >
              <span class="field-label-ia"
                >Descrição do caso e instruções para a IA</span
              >
              <div
                class="row items-start"
                style="gap: 12px"
              >
                <div class="col prompt-input-wrap">
                  <q-input
                    v-model="prompt"
                    outlined
                    dense
                    type="textarea"
                    autogrow
                    bg-color="white"
                    placeholder="Ex: Cliente foi demitido sem justa causa após 5 anos de empresa, não recebeu aviso prévio nem FGTS..."
                    :disable="loading"
                  />
                </div>
                <q-btn
                  no-caps
                  label="Gerar com IA"
                  @click="enviar()"
                  class="ia-btn"
                  icon="bolt"
                  :disable="!formData.tipo || !prompt.trim()"
                  :loading="loading"
                />
              </div>
            </div>
          </div>

          <div
            class="col-12"
            style="margin-top: 24px"
          >
            <div class="flex justify-between items-center q-mb-md">
              <label
                class="text-subtitle2 text-weight-bold"
                style="color: #4a4a4a"
              >
                Conteúdo da petição
              </label>
              <q-btn
                no-caps
                label="Copiar conteúdo"
                @click="copyText()"
                color="primary"
                size="small"
                outline
                :disable="!formData.conteudo"
              />
            </div>

            <div style="position: relative;">
              <Transition
                name="fade"
                mode="out-in"
              >
                <div
                  v-if="loading"
                  key="loading"
                  class="ai-loading-container"
                >
                  <Transition
                    name="slide-up"
                    mode="out-in"
                  >
                    <div
                      :key="stepAtual"
                      class="ai-loading-content"
                    >
                      <div
                        class="ai-icon-wrap"
                        :style="{ background: currentStep.gradient }"
                      >
                        <q-icon
                          :name="currentStep.icon"
                          size="40px"
                          color="white"
                        />
                      </div>
                      <div
                        class="text-subtitle1 text-bold q-mt-lg"
                        style="color: #4a4a4a"
                      >
                        {{ currentStep.titulo }}
                      </div>
                      <div
                        class="text-body2 q-mt-xs"
                        style="color: #7a7a7a"
                      >
                        {{ currentStep.descricao }}
                      </div>
                      <div class="ai-dots q-mt-lg">
                        <span /><span /><span />
                      </div>
                      <q-btn
                        flat
                        no-caps
                        color="negative"
                        label="Cancelar geração"
                        icon="close"
                        size="md"
                        class="q-mt-lg"
                        style="position: relative; z-index: 101;"
                        @click="cancelarGeracao"
                      />
                    </div>
                  </Transition>
                </div>

                <TextEditorComponent
                  v-else
                  key="editor"
                  v-model="formData.conteudo"
                />
              </Transition>
            </div>
          </div>
        </div>

        <div
          class="row justify-end q-mt-lg"
          style="gap: 8px"
        >
          <q-btn
            flat
            no-caps
            color="primary"
            label="Cancelar"
            class="q-mr-sm"
            :to="{ name: 'peticoes' }"
          />
          <q-btn
            color="green"
            no-caps
            size="small"
            :label="editMode ? 'Atualizar' : 'Salvar modelo'"
            type="submit"
            :loading="isLoading"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar, type QForm } from 'quasar'
import axios from 'axios'
import { useNotification } from '@/composables/useNotification'
import InputTextComponent from '@/components/InputTextComponent.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import TextEditorComponent from '@/components/TextEditorComponent.vue'
import type { PeticaoModelo } from '@/types/peticoes/PeticaoModelo'
import { usePeticaoService } from '@/services/api/peticao.service'
import { copiarConteudoFormatado } from '@/utils/copiarConteudo'

const route = useRoute()
const notification = useNotification()
const $q = useQuasar()
const peticaoService = usePeticaoService()

const editMode = ref(false)
const idPeticao = ref<string>()
const formRef = ref<InstanceType<typeof QForm> | null>(null)
const loading = ref(false)
const isLoading = ref(false)
const prompt = ref('')
const stepAtual = ref(0)
const currentStep = computed(() => steps[stepAtual.value % steps.length]!)
let stepTimer: ReturnType<typeof setInterval> | null = null
let abortController: AbortController | null = null

const formData = ref({
  nome: '',
  tipo: null as string | null,
  conteudo: '',
})

const tiposPeticao = [
  { title: 'Inicial', value: 'INICIAL' },
  { title: 'Contestação', value: 'CONTESTACAO' },
  { title: 'Recurso', value: 'RECURSO' },
  { title: 'Agravo', value: 'AGRAVO' },
  { title: 'Outros', value: 'OUTROS' },
]

const steps = [
  {
    icon: 'gavel',
    titulo: 'Analisando o tipo de petição',
    descricao: 'Identificando a estrutura jurídica adequada...',
    gradient: 'linear-gradient(135deg, #003366, #0066cc)',
  },
  {
    icon: 'description',
    titulo: 'Estruturando o documento',
    descricao: 'Organizando endereçamento, partes e seções...',
    gradient: 'linear-gradient(135deg, #1a237e, #3949ab)',
  },
  {
    icon: 'draw',
    titulo: 'Redigindo argumentos jurídicos',
    descricao: 'Aplicando legislação e jurisprudência pertinente...',
    gradient: 'linear-gradient(135deg, #4a148c, #7928ca)',
  },
  {
    icon: 'auto_fix_high',
    titulo: 'Finalizando a petição',
    descricao: 'Revisando pedidos e formatação do documento...',
    gradient: 'linear-gradient(135deg, #6a1b9a, #ab47bc)',
  },
]

function requiredField(val: unknown, fieldName = 'Campo'): boolean | string {
  return !!val || `${fieldName} é obrigatório`
}

onMounted(async () => {
  const idRota = route.params.id as string
  if (idRota && idRota !== 'novo') {
    editMode.value = true
    idPeticao.value = idRota
    const peticao = await peticaoService.getById(idPeticao.value)
    if (peticao) {
      formData.value = {
        nome: peticao.nome,
        tipo: peticao.tipo,
        conteudo: peticao.conteudo || '',
      }
    }
  }
})

onUnmounted(() => {
  if (stepTimer) clearInterval(stepTimer)
})

async function handleSubmit() {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (!isValid) {
    notification.error('Preencha os campos obrigatórios')
    return
  }

  isLoading.value = true
  try {
    if (editMode.value && idPeticao.value) {
      await peticaoService.update(idPeticao.value, { ...formData.value })
      notification.success('Modelo atualizado com sucesso!')
    } else {
      await peticaoService.create({
        nome: formData.value.nome,
        tipo: formData.value.tipo!,
        conteudo: formData.value.conteudo,
      } as PeticaoModelo)
      notification.success('Modelo salvo com sucesso!')
    }
  } catch {
    notification.error('Erro ao salvar modelo.')
  } finally {
    isLoading.value = false
  }
}

async function enviar() {
  if (!formData.value.tipo?.trim() || !prompt.value.trim()) return

  loading.value = true
  stepAtual.value = 0
  abortController = new AbortController()
  stepTimer = setInterval(() => {
    stepAtual.value = (stepAtual.value + 1) % steps.length
  }, 4000)

  try {
    const tipoPeticao = formData.value.tipo!
    formData.value.conteudo = await peticaoService.gerarComIA(tipoPeticao, prompt.value, abortController!.signal)
    notification.success('Petição gerada com sucesso!')
  } catch (erro: any) {
    if (!axios.isCancel(erro)) {
      notification.error('Erro ao gerar modelo: ' + (erro.response?.data?.message || erro.message || 'Desconhecido'))
    }
  } finally {
    loading.value = false
    abortController = null
    if (stepTimer) { clearInterval(stepTimer); stepTimer = null }
  }
}

function cancelarGeracao() {
  abortController?.abort()
}

async function copyText() {
  const html = formData.value.conteudo
  if (!html?.trim()) return
  try {
    await copiarConteudoFormatado(html)
    $q.notify({
      message: 'Conteúdo copiado (formatação preservada para Docs/Word)!',
      color: 'green-5',
      icon: 'check_circle',
      position: 'bottom',
    })
  } catch {
    $q.notify({
      message: 'Falha ao copiar o texto.',
      color: 'red-5',
      icon: 'error',
      position: 'bottom',
    })
  }
}
</script>

<style scoped>
.field-label {
  font-size: 14px;
  color: #7a7a7a;
}

.page-block-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  cursor: not-allowed;
}

.field-label-ia {
  font-size: 14px;
  font-weight: 700;
  color: #003366;
}

.ia-btn {
  background: linear-gradient(135deg, #003366, #7928ca);
  color: white;
  height: 40px;
  padding: 0 20px;
  flex-shrink: 0;
}

.prompt-input-wrap :deep(.q-field--outlined .q-field__control::before) {
  border-color: #7928ca;
  border-width: 1.5px;
}

.prompt-input-wrap :deep(.q-field--outlined:hover .q-field__control::before) {
  border-color: #003366;
}

.ai-loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.ai-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px;
}

.ai-icon-wrap {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.ai-dots {
  display: flex;
  gap: 8px;
}

.ai-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #003366;
  animation: bounce 1.2s ease-in-out infinite;
}

.ai-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.ai-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>

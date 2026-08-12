<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">
          {{ editMode ? 'Editar Jurisprudência' : 'Salvar Jurisprudência' }}
        </h4>
      </div>
    </div>

    <div class="bg-white q-pa-lg" style="border: 0.4px solid gray;">
      <q-form ref="formRef" @submit.prevent="handleSubmit">
        <div v-if="editMode" class="q-mb-md">
          <q-chip v-if="formData.link" icon="link" outline color="primary">
            <a :href="formData.link" target="_blank" rel="noopener noreferrer" class="text-primary">
              Ver fonte original
            </a>
          </q-chip>
          <q-chip
            v-else-if="jurisprudenciaOriginal?.arquivoNomeOriginal"
            icon="description"
            outline
            color="primary"
            clickable
            @click="abrirArquivoOriginal"
          >
            {{ jurisprudenciaOriginal.arquivoNomeOriginal }}
          </q-chip>
        </div>

        <div v-else class="q-mb-md">
          <q-btn-toggle
            v-model="origemSelecionada"
            spread
            no-caps
            toggle-color="secondary"
            color="white"
            text-color="primary"
            :options="[
              { label: 'Colar link', value: 'LINK', icon: 'link' },
              { label: 'Enviar arquivo', value: 'UPLOAD', icon: 'upload_file' },
            ]"
          />

          <InputTextComponent
            v-if="origemSelecionada === 'LINK'"
            v-model="formData.link"
            label="Link da jurisprudência"
            class="q-mt-md"
            dense
            outlined
            :rules="[validarUrlRule]"
          />

          <q-file
            v-else
            v-model="arquivoSelecionado"
            label="Arquivo (PDF, DOC ou DOCX)"
            class="q-mt-md"
            dense
            outlined
            accept=".pdf,.doc,.docx"
            :max-file-size="TAMANHO_MAXIMO_ARQUIVO"
            :rules="[val => !!val || 'Selecione um arquivo']"
            @rejected="onArquivoRejeitado"
          >
            <template #prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12">
            <InputTextComponent
              v-model="formData.titulo"
              label="Título*"
              dense
              outlined
              :rules="[val => requiredField(val, 'Título')]"
            />
          </div>

          <div class="col-6">
            <InputTextComponent
              v-model="formData.tribunal"
              label="Tribunal"
              dense
              outlined
            />
          </div>

          <div class="col-6">
            <InputTextComponent
              v-model="formData.numeroProcesso"
              label="Número do processo"
              dense
              outlined
            />
          </div>

          <div class="col-6">
            <SelectComponent
              v-model="formData.tipoAcao"
              label="Tipo de Ação"
              :options="tipoAcaoOptions"
              option-value="value"
              option-label="title"
            />
          </div>

          <div class="col-6">
            <InputDateComponent
              v-model="formData.dataJulgamento"
              label="Data de julgamento"
              dense
              outlined
            />
          </div>

          <div class="col-6">
            <InputTextComponent
              v-model="formData.tema"
              label="Tema"
              dense
              outlined
            />
          </div>

          <div class="col-6">
            <InputTextComponent
              v-model="formData.relator"
              label="Relator"
              dense
              outlined
            />
          </div>

          <div class="col-6">
            <InputTextComponent
              v-model="formData.orgaoJulgador"
              label="Órgão julgador"
              dense
              outlined
            />
          </div>

          <q-input
            v-model="formData.ementa"
            label="Ementa"
            type="textarea"
            rows="3"
            outlined
            dense
            class="q-mb-md col-12"
          />

          <q-input
            v-model="formData.anotacaoPessoal"
            label="Anotação pessoal (por que é útil, para que tipo de caso)"
            type="textarea"
            rows="2"
            outlined
            dense
            class="q-mb-md col-12"
          />
        </div>

        <div class="row justify-end q-mt-lg">
          <q-btn
            color="primary"
            size="small"
            label="Cancelar"
            class="q-mr-sm"
            flat
            :to="{ name: 'jurisprudencia-biblioteca' }"
          />

          <q-btn
            color="green"
            size="small"
            :label="editMode ? 'Atualizar' : 'Salvar'"
            type="submit"
            :loading="isLoading"
          />
        </div>
      </q-form>
    </div>

    <PdfViewerDialog
      v-model="pdfDialog"
      :arquivo="arquivoVisualizado"
      :pdf-data="pdfData"
      :loading="pdfLoading"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { QForm, QRejectedEntry } from 'quasar'
import { useNotification } from '@/composables/useNotification'
import InputDateComponent from '@/components/InputDateComponent.vue'
import InputTextComponent from '@/components/InputTextComponent.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import PdfViewerDialog from '@/components/documentos/PdfViewerDialog.vue'
import { useJurisprudenciaService } from '@/services'
import { useAbrirArquivoJurisprudencia } from '@/composables/useAbrirArquivoJurisprudencia'
import { isoToBr, brToIso } from '@/utils/date'
import { getApiErrorMessage } from '@/utils/apiError'
import type { Jurisprudencia } from '@/types/jurisprudencias/Jurisprudencia'

const route = useRoute()
const router = useRouter()
const jurisprudenciaService = useJurisprudenciaService()
const notification = useNotification()
const {
  pdfDialog,
  pdfLoading,
  pdfData,
  arquivoSelecionado: arquivoVisualizado,
  abrirArquivo,
} = useAbrirArquivoJurisprudencia()

const editMode = ref(false)
const idJurisprudencia = ref<string>()
const jurisprudenciaOriginal = ref<Jurisprudencia | null>(null)
const formRef = ref<InstanceType<typeof QForm> | null>(null)
const isLoading = ref(false)
const origemSelecionada = ref<'LINK' | 'UPLOAD'>('LINK')
const arquivoSelecionado = ref<File | null>(null)

const TAMANHO_MAXIMO_ARQUIVO = 20 * 1024 * 1024

const tipoAcaoOptions = [
  { title: 'Cível', value: 'CIVEL' },
  { title: 'Trabalhista', value: 'TRABALHISTA' },
  { title: 'Criminal', value: 'CRIMINAL' },
  { title: 'Tributário', value: 'TRIBUTARIO' },
  { title: 'Família', value: 'FAMILIA' },
  { title: 'Consumidor', value: 'CONSUMIDOR' },
  { title: 'Outros', value: 'OUTROS' },
]

const formData = ref({
  titulo: '',
  tribunal: '',
  numeroProcesso: '',
  tema: '',
  ementa: '',
  relator: '',
  orgaoJulgador: '',
  dataJulgamento: '',
  tipoAcao: 'OUTROS',
  anotacaoPessoal: '',
  favorito: false,
  link: '',
})

function requiredField(val: any, fieldName = 'Campo'): boolean | string {
  return !!val || `${fieldName} é obrigatório`
}

function validarUrlRule(val: string): boolean | string {
  if (!val) return 'Link é obrigatório'
  try {
    const url = new URL(val)
    return url.protocol === 'http:' || url.protocol === 'https:' || 'Link deve começar com http:// ou https://'
  } catch {
    return 'Informe uma URL válida'
  }
}

function onArquivoRejeitado(entries: QRejectedEntry[]) {
  const motivo = entries[0]?.failedPropValidation === 'max-file-size'
    ? 'Arquivo excede o limite'
    : 'Arquivo em formato não permitido'
  notification.error(motivo)
}

function abrirArquivoOriginal() {
  if (!idJurisprudencia.value) return
  abrirArquivo(idJurisprudencia.value, jurisprudenciaOriginal.value?.arquivoNomeOriginal)
}

onMounted(async () => {
  const idRota = route.params.id as string

  if (idRota) {
    editMode.value = true
    idJurisprudencia.value = idRota

    const item = await jurisprudenciaService.getById(idRota)
    jurisprudenciaOriginal.value = item

    formData.value = {
      titulo: item.titulo ?? '',
      tribunal: item.tribunal ?? '',
      numeroProcesso: item.numeroProcesso ?? '',
      tema: item.tema ?? '',
      ementa: item.ementa ?? '',
      relator: item.relator ?? '',
      orgaoJulgador: item.orgaoJulgador ?? '',
      dataJulgamento: isoToBr(item.dataJulgamento),
      tipoAcao: item.tipoAcao ?? 'OUTROS',
      anotacaoPessoal: item.anotacaoPessoal ?? '',
      favorito: item.favorito ?? false,
      link: item.link ?? '',
    }
  }
})

function camposEditaveis() {
  return {
    titulo: formData.value.titulo,
    tribunal: formData.value.tribunal || null,
    numeroProcesso: formData.value.numeroProcesso || null,
    ementa: formData.value.ementa || null,
    tema: formData.value.tema || null,
    dataJulgamento: formData.value.dataJulgamento ? brToIso(formData.value.dataJulgamento) : null,
    relator: formData.value.relator || null,
    orgaoJulgador: formData.value.orgaoJulgador || null,
    tipoAcao: formData.value.tipoAcao,
    anotacaoPessoal: formData.value.anotacaoPessoal || null,
    favorito: formData.value.favorito,
  }
}

async function handleSubmit() {
  if (!formRef.value) return

  const isValid = await formRef.value.validate()
  if (!isValid) {
    notification.error('Formulário inválido')
    return
  }

  isLoading.value = true
  try {
    if (editMode.value) {
      await updateJurisprudencia()
    } else {
      await createJurisprudencia()
    }
  } finally {
    isLoading.value = false
  }
}

async function createJurisprudencia() {
  try {
    if (origemSelecionada.value === 'LINK') {
      await jurisprudenciaService.create({ ...camposEditaveis(), link: formData.value.link })
    } else {
      await jurisprudenciaService.create(camposEditaveis(), arquivoSelecionado.value ?? undefined)
    }
    notification.success('Jurisprudência salva na sua biblioteca!')
    router.push({ name: 'jurisprudencia-biblioteca' })
  } catch (error: any) {
    notification.error('Não foi possível salvar. Erro: ' + getApiErrorMessage(error), 9000)
  }
}

async function updateJurisprudencia() {
  if (!idJurisprudencia.value) return

  try {
    await jurisprudenciaService.update(idJurisprudencia.value, camposEditaveis())
    notification.success('Jurisprudência atualizada com sucesso!')
    router.push({ name: 'jurisprudencia-biblioteca' })
  } catch (error: any) {
    notification.error('Não foi possível atualizar. Erro: ' + getApiErrorMessage(error), 9000)
  }
}
</script>

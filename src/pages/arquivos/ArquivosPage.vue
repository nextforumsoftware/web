<template>
  <div class="q-pa-md">
    <div
      class="flex justify-between items-center q-mb-sm"
      style="height: 80px"
    >
      <div class="flex column">
        <div class="row items-center q-gutter-xs q-mb-xs">
          <span
            class="text-grey-6 cursor-pointer text-sm"
            @click="router.push({ name: 'pastas' })"
          >
            Documentos
          </span>
          <template
            v-for="(crumb, index) in breadcrumbs"
            :key="crumb.id"
          >
            <q-icon
              name="chevron_right"
              size="16px"
              color="grey-5"
            />
            <span
              :class="
                index === breadcrumbs.length - 1
                  ? 'text-primary text-bold text-sm'
                  : 'text-grey-6 cursor-pointer text-sm'
              "
              @click="
                index < breadcrumbs.length - 1 &&
                router.push({ name: 'arquivos', params: { id: crumb.id } })
              "
            >
              {{ crumb.nome }}
            </span>
          </template>
        </div>
        <h4 class="text-terciary text-bold q-my-none">
          {{ pasta?.nome ?? 'Arquivos' }}
        </h4>
      </div>

      <div>
        <NextforumFileInput
          :accept="tiposPermitidos"
          accept-hint="Use PDF, imagem, Word, Excel, CSV ou vídeo MP4 (até 50MB)."
          :max-size-mb="50"
          @change="onFilesSelected"
        >
          <q-btn
            icon="cloud_upload"
            label="Upload Arquivos"
            color="primary"
            no-caps
            :loading="isLoading"
          />
        </NextforumFileInput>
      </div>
    </div>
  </div>

  <div class="q-pa-md">
    <div
      v-if="isLoading"
      class="column items-center q-gutter-y-md q-pa-xl"
    >
      <q-spinner-hourglass
        color="primary"
        size="4em"
      />
      <span class="text-grey-8">Carregando...</span>
    </div>

    <q-infinite-scroll
      v-else
      @load="loadMore"
      :offset="250"
    >
      <q-table
        flat
        bordered
        :rows="documentos"
        :columns="columns"
        row-key="id"
        :hide-bottom="documentos.length > 0"
        style="cursor: pointer"
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

        <template #body="props">
          <q-tr
            :props="props"
            @click="onRowClick(props.row)"
            style="cursor: pointer"
          >
            <q-td
              key="nome"
              :props="props"
            >
              <div class="row items-center">
                <q-icon
                  :name="
                    props.row._type === 'pasta'
                      ? 'folder'
                      : getFileIcon(props.row.nome).icon
                  "
                  :color="
                    props.row._type === 'pasta'
                      ? 'secondary'
                      : getFileIcon(props.row.nome).color
                  "
                  class="q-mr-sm"
                  size="22px"
                />
                <span class="text-weight-medium">{{ props.row.nome }}</span>
              </div>
            </q-td>
            <q-td
              key="createdAt"
              :props="props"
              >{{
                props.row._type === 'pasta'
                  ? isoToBr(props.row.dataUltimaModificacao)
                  : formatarDatetime(props.row.createdAt)
              }}</q-td
            >

            <q-menu
              context-menu
              touch-position
            >
              <q-list style="min-width: 160px">
                <template v-if="props.row._type === 'pasta'">
                  <q-item
                    clickable
                    v-close-popup
                    @click="onRowClick(props.row)"
                  >
                    <q-item-section avatar
                      ><q-icon
                        name="folder_open"
                        color="secondary"
                    /></q-item-section>
                    <q-item-section>Abrir</q-item-section>
                  </q-item>
                </template>

                <template v-else>
                  <q-item
                    clickable
                    v-close-popup
                    @click="onRowClick(props.row)"
                  >
                    <q-item-section avatar
                      ><q-icon
                        name="visibility"
                        color="primary"
                    /></q-item-section>
                    <q-item-section>Visualizar</q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="downloadArquivo(props.row)"
                  >
                    <q-item-section avatar
                      ><q-icon
                        name="download"
                        color="green-7"
                    /></q-item-section>
                    <q-item-section>Download</q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item
                    clickable
                    v-close-popup
                    @click="confirmarExclusao(props.row)"
                  >
                    <q-item-section avatar
                      ><q-icon
                        name="delete"
                        color="red-6"
                    /></q-item-section>
                    <q-item-section class="text-red-6">Excluir</q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-menu>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width flex flex-center q-pa-md text-grey-6">
            Nenhum arquivo encontrado.
          </div>
        </template>
      </q-table>
    </q-infinite-scroll>
  </div>

  <PdfViewerDialog
    v-model="pdfDialog"
    :arquivo="selectedArquivo"
    :pdf-data="pdfData"
    :loading="pdfLoading"
  />

  <VideoPlayerDialog
    v-model="videoDialog"
    :arquivo="selectedArquivo"
    :video-url="videoUrl"
    :loading="videoLoading"
  />

  <UploadArquivosDialog
    v-model="uploadDialog"
    :files="filesToUpload"
    :pasta-id="pastaId"
    @uploaded="onUploaded"
  />
</template>

<script setup lang="ts">
import PdfViewerDialog from '@/components/documentos/PdfViewerDialog.vue'
import VideoPlayerDialog from '@/components/documentos/VideoPlayerDialog.vue'
import NextforumFileInput from '@/components/generic/NextforumFileInput.vue'
import UploadArquivosDialog from '@/components/arquivos/UploadArquivosDialog.vue'
import { useArquivoService } from '@/services/api/arquivo.service'
import { usePastaService } from '@/services/api/pasta.service'
import type { Arquivo } from '@/types/arquivos/Arquivo'
import { useQuasar, type QTableColumn } from 'quasar'
import { computed, onMounted, ref, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'
import { useRoute, useRouter } from 'vue-router'
import { getFileIcon } from '@/utils/fileIcon'
import { isoToBr, formatarDatetime } from '@/utils/date'

const arquivosService = useArquivoService()
const pastaService = usePastaService()
const route = useRoute()
const router = useRouter()
const { success, error } = useNotification()
const $q = useQuasar()

const isLoading = ref(false)
const pasta = ref<any>(null)
const breadcrumbs = ref<{ id: string; nome: string }[]>([])
const documentos = ref<any[]>([])

const uploadDialog = ref(false)
const filesToUpload = ref<File[]>([])

const pdfDialog = ref(false)
const pdfLoading = ref(false)
const pdfData = ref<ArrayBuffer | null>(null)

const videoDialog = ref(false)
const videoLoading = ref(false)
const videoUrl = ref<string | null>(null)

const selectedArquivo = ref<Arquivo | null>(null)

const pastaId = computed(() => route.params.id as string)

async function carregar(id: string) {
  try {
    isLoading.value = true
    const [pastaData, arquivos] = await Promise.all([
      pastaService.getById(id),
      arquivosService.getAllByPasta(id),
    ])
    pasta.value = pastaData
    breadcrumbs.value = buildBreadcrumbs(pastaData)
    const subpastas = (pastaData.subpastas ?? []).map((subpasta: any) => ({
      ...subpasta,
      _type: 'pasta',
    }))
    const files = (arquivos ?? []).map((arquivo: any) => ({
      ...arquivo,
      _type: 'arquivo',
    }))
    documentos.value = [...subpastas, ...files]
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function buildBreadcrumbs(p: any): { id: string; nome: string }[] {
  const crumbs: { id: string; nome: string }[] = []
  let current = p
  while (current) {
    crumbs.unshift({ id: current.id, nome: current.nome })
    current = current.parent ?? null
  }
  return crumbs
}

onMounted(() => carregar(route.params.id as string))
watch(
  () => route.params.id,
  (id) => {
    if (id) carregar(id as string)
  },
)

const columns: QTableColumn[] = [
  { name: 'nome', field: 'nome', label: 'Nome', align: 'left', sortable: true },
  {
    name: 'createdAt',
    field: 'createdAt',
    label: 'Modificação',
    align: 'left',
  },
]

const tiposPermitidos = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'text/plain',
  'video/mp4',
]

function onFilesSelected(files: File[]) {
  filesToUpload.value = files
  uploadDialog.value = true
}

function onUploaded(criados: Arquivo[]) {
  documentos.value.push(
    ...criados.map((arquivo) => ({ ...arquivo, _type: 'arquivo' })),
  )
}

async function loadMore(_: number, done: (stop?: boolean) => void) {
  done(true)
}

async function onRowClick(row: any) {
  if (row._type === 'pasta') {
    router.push({ name: 'arquivos', params: { id: row.id } })
    return
  }

  const arquivo = row as Arquivo
  const isPdf = arquivo.nome.toLowerCase().endsWith('.pdf')
  const isVideo = arquivo.nome.toLowerCase().endsWith('.mp4')

  if (isPdf) {
    selectedArquivo.value = arquivo
    pdfData.value = null
    pdfDialog.value = true
    pdfLoading.value = true
    try {
      pdfData.value = await arquivosService.download(arquivo.id)
    } catch (err) {
      console.error('Erro ao carregar PDF:', err)
    } finally {
      pdfLoading.value = false
    }
    return
  }

  if (isVideo) {
    selectedArquivo.value = arquivo
    videoUrl.value = null
    videoDialog.value = true
    videoLoading.value = true
    try {
      videoUrl.value = await arquivosService.getPresignedUrl(arquivo.id)
    } catch (err) {
      console.error('Erro ao carregar vídeo:', err)
    } finally {
      videoLoading.value = false
    }
    return
  }

  try {
    const url = await arquivosService.getPresignedUrl(arquivo.id)
    window.open(url, '_blank')
  } catch (err) {
    console.error('Erro ao abrir arquivo:', err)
  }
}

async function downloadArquivo(arquivo: Arquivo) {
  try {
    const data = await arquivosService.download(arquivo.id)
    const blob = new Blob([data])
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = arquivo.nome
    link.click()
    URL.revokeObjectURL(objectUrl)
  } catch (err) {
    error('Erro ao fazer download do arquivo.')
  }
}

function confirmarExclusao(arquivo: Arquivo) {
  $q.dialog({
    title: 'Excluir arquivo',
    message: `Deseja excluir "${arquivo.nome}"? Esta ação não pode ser desfeita.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Excluir', color: 'red' },
    persistent: true,
  }).onOk(async () => {
    try {
      await arquivosService.remove(arquivo.id)
      documentos.value = documentos.value.filter(
        (documento) => documento.id !== arquivo.id,
      )
      success('Arquivo excluído com sucesso.')
    } catch (err) {
      error('Erro ao excluir arquivo.')
    }
  })
}
</script>

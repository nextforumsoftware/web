<template>
  <q-dialog
    v-model="model"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card
      class="column no-wrap"
      style="background: #f0f0f0; width: 85vw; max-width: 85vw; height: 90vh"
    >
      <div
        class="row items-center no-wrap q-px-md bg-grey-9 text-white"
        style="height: 56px; flex-shrink: 0; gap: 12px"
      >
        <div
          class="row items-center col-3 no-wrap"
          style="min-width: 0"
        >
          <q-icon
            name="picture_as_pdf"
            size="20px"
            color="red-4"
            class="q-mr-sm"
            style="flex-shrink: 0"
          />
          <span class="text-body2 ellipsis">{{ arquivo?.nome }}</span>
        </div>

        <div
          class="row items-center justify-center col-6 no-wrap"
          style="gap: 6px"
        >
          <q-input
            v-model="searchTerm"
            dense
            dark
            standout="bg-grey-8"
            placeholder="Pesquisar no documento..."
            style="min-width: 240px; max-width: 340px"
            @keyup.enter="nextMatch"
          >
            <template #prepend>
              <q-icon
                name="search"
                size="18px"
              />
            </template>
            <template #append>
              <q-icon
                v-if="searchTerm"
                name="close"
                size="16px"
                class="cursor-pointer"
                @click="clearSearch"
              />
            </template>
          </q-input>

          <template v-if="matches.length > 0">
            <q-btn
              dense
              flat
              round
              icon="keyboard_arrow_up"
              size="sm"
              @click="prevMatch"
            />
            <span
              class="text-caption text-grey-4"
              style="white-space: nowrap"
            >
              {{ currentMatchIndex + 1 }} / {{ matches.length }}
            </span>
            <q-btn
              dense
              flat
              round
              icon="keyboard_arrow_down"
              size="sm"
              @click="nextMatch"
            />
          </template>

          <span
            v-else-if="searchTerm && !searching"
            class="text-caption text-grey-5"
          >
            Sem resultados
          </span>

          <q-spinner
            v-else-if="searching"
            size="16px"
            color="grey-4"
          />
        </div>

        <div
          class="row items-center justify-end col-3 no-wrap"
          style="gap: 4px"
        >
          <q-btn
            dense
            flat
            round
            icon="remove"
            size="sm"
            :disable="zoom <= 0.4"
            @click="zoomOut"
          >
            <q-tooltip
              anchor="bottom middle"
              self="top middle"
              >Diminuir zoom</q-tooltip
            >
          </q-btn>
          <span
            class="text-caption text-grey-4"
            style="min-width: 38px; text-align: center"
          >
            {{ Math.round(zoom * 100) }}%
          </span>
          <q-btn
            dense
            flat
            round
            icon="add"
            size="sm"
            :disable="zoom >= 3"
            @click="zoomIn"
          >
            <q-tooltip
              anchor="bottom middle"
              self="top middle"
              >Aumentar zoom</q-tooltip
            >
          </q-btn>

          <q-separator
            vertical
            dark
            inset
            class="q-mx-xs"
          />

          <q-btn
            dense
            flat
            round
            icon="print"
            size="sm"
            :disable="!pdfData"
            @click="printFile"
          >
            <q-tooltip
              anchor="bottom middle"
              self="top middle"
              >Imprimir</q-tooltip
            >
          </q-btn>
          <q-btn
            dense
            flat
            round
            icon="download"
            size="sm"
            :disable="!pdfData"
            @click="downloadFile"
          >
            <q-tooltip
              anchor="bottom middle"
              self="top middle"
              >Baixar</q-tooltip
            >
          </q-btn>

          <q-separator
            vertical
            dark
            inset
            class="q-mx-xs"
          />

          <q-btn
            dense
            flat
            round
            icon="close"
            size="sm"
            v-close-popup
            class="q-mr-lg"
          >
            <q-tooltip
              anchor="bottom middle"
              self="top middle"
              >Fechar</q-tooltip
            >
          </q-btn>
        </div>
      </div>

      <div
        class="col"
        style="overflow: hidden; position: relative"
      >
        <PdfViewer
          v-if="pdfData"
          ref="viewerRef"
          :pdf-data="pdfData"
          :zoom="zoom"
          :annotations="[]"
          style="height: 100%"
        />

        <div
          v-else-if="loading"
          class="flex flex-center"
          style="height: 100%"
        >
          <div class="column items-center q-gutter-y-md">
            <q-spinner
              size="48px"
              color="primary"
            />
            <span class="text-grey-7">Carregando arquivo...</span>
          </div>
        </div>

        <div
          v-else
          class="flex flex-center"
          style="height: 100%"
        >
          <span class="text-grey-7">Não foi possível carregar o arquivo.</span>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import PdfViewer from './PdfViewer.vue'

const props = defineProps<{
  modelValue: boolean
  arquivo: { nome: string } | null
  pdfData: ArrayBuffer | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const model = ref(props.modelValue)
watch(
  () => props.modelValue,
  (value) => (model.value = value),
)
watch(model, (value) => emit('update:modelValue', value))

const viewerRef = ref<InstanceType<typeof PdfViewer> | null>(null)

const zoom = ref(1)
const searchTerm = ref('')
const searching = ref(false)
const matches = ref<number[]>([])
const currentMatchIndex = ref(0)

watch(searchTerm, async (term) => {
  if (!term) {
    matches.value = []
    currentMatchIndex.value = 0
    return
  }
  searching.value = true
  matches.value = (await viewerRef.value?.search(term)) ?? []
  currentMatchIndex.value = 0
  searching.value = false
  if (matches.value.length > 0) {
    const firstMatch = matches.value[0]
    if (firstMatch !== undefined) {
      viewerRef.value?.scrollToPage(firstMatch)
    }
  }
})

function nextMatch() {
  if (!matches.value.length) return
  currentMatchIndex.value = (currentMatchIndex.value + 1) % matches.value.length
  const match = matches.value[currentMatchIndex.value]
  if (match !== undefined) {
    viewerRef.value?.scrollToPage(match)
  }
}

function prevMatch() {
  if (!matches.value.length) return
  currentMatchIndex.value =
    (currentMatchIndex.value - 1 + matches.value.length) % matches.value.length
  const match = matches.value[currentMatchIndex.value]
  if (match !== undefined) {
    viewerRef.value?.scrollToPage(match)
  }
}

function clearSearch() {
  searchTerm.value = ''
  matches.value = []
  currentMatchIndex.value = 0
}

function zoomIn() {
  zoom.value = Math.min(3, parseFloat((zoom.value + 0.25).toFixed(2)))
}

function zoomOut() {
  zoom.value = Math.max(0.4, parseFloat((zoom.value - 0.25).toFixed(2)))
}

function printFile() {
  if (!props.pdfData) return
  const blob = new Blob([props.pdfData], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  document.body.appendChild(iframe)
  iframe.onload = () => {
    iframe.contentWindow?.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
      URL.revokeObjectURL(url)
    }, 60_000)
  }
}

function downloadFile() {
  if (!props.pdfData || !props.arquivo) return
  const blob = new Blob([props.pdfData], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.arquivo.nome
  a.click()
  URL.revokeObjectURL(url)
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) clearSearch()
  },
)
</script>

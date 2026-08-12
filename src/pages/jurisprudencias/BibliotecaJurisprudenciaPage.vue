<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Jurisprudências</h4>
        <p class="text-terciary q-my-none">Jurisprudências salvas pelo seu escritório</p>
      </div>
      <q-btn
        color="secondary"
        icon="add_circle"
        label="Nova Jurisprudência"
        style="max-width: 300px;"
        :to="{ name: 'jurisprudencia-form' }"
      />
    </div>

    <div class="row q-col-gutter-sm q-mb-md items-center">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filters.termo"
          outlined
          dense
          bg-color="white"
          placeholder="Buscar por título, ementa, processo ou tema..."
          clearable
          clear-icon="close"
        >
          <template #prepend>
            <q-icon name="search" size="18px" />
          </template>
        </q-input>
      </div>

      <div class="col-6 col-md-3">
        <q-input
          v-model="filters.tribunal"
          outlined
          dense
          bg-color="white"
          label="Tribunal"
          clearable
        />
      </div>

      <div class="col-6 col-md-3">
        <q-select
          v-model="filters.tipoAcao"
          outlined
          dense
          bg-color="white"
          label="Tipo de Ação"
          clearable
          emit-value
          map-options
          :options="tipoAcaoOptions"
        />
      </div>
    </div>

    <div v-if="isLoading" class="column items-center q-gutter-y-md q-pa-xl">
      <q-spinner-hourglass color="primary" size="4em" />
      <span class="text-grey-8">Carregando biblioteca...</span>
    </div>

    <q-infinite-scroll
      v-else
      :offset="250"
      @load="loadMore"
    >
      <q-table
        flat
        bordered
        :rows="jurisprudencias"
        :columns="columns"
        row-key="id"
        :hide-bottom="jurisprudencias.length > 0"
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

        <template #body="props">
          <q-tr :props="props" style="cursor: pointer" @click="abrirEdicao(props.row)">
            <q-td key="favorito" :props="props" auto-width>
              <q-btn
                :icon="props.row.favorito ? 'star' : 'star_border'"
                :color="props.row.favorito ? 'amber-8' : 'grey-6'"
                flat
                round
                dense
                @click.stop="toggleFavorito(props.row)"
              />
            </q-td>

            <q-td key="titulo" :props="props">
              <span class="text-weight-medium text-grey-9">{{ props.row.titulo }}</span>
            </q-td>

            <q-td key="tribunal" :props="props">
              <span class="text-grey-7">{{ props.row.tribunal || '-' }}</span>
            </q-td>

            <q-td key="tipoAcao" :props="props">
              <span class="text-grey-7">{{ formatTipoAcao(props.row.tipoAcao) }}</span>
            </q-td>

            <q-td key="dataJulgamento" :props="props">
              <span class="text-grey-7">{{ props.row.dataJulgamento ? formatarData(props.row.dataJulgamento) : '-' }}</span>
            </q-td>

            <q-td key="origem" :props="props" auto-width>
              <q-icon
                :name="props.row.origem === 'UPLOAD' ? 'description' : 'link'"
                color="grey-7"
                size="20px"
              >
                <q-tooltip>{{ props.row.origem === 'UPLOAD' ? 'Arquivo enviado' : 'Link externo' }}</q-tooltip>
              </q-icon>
            </q-td>

            <q-td key="acoes" :props="props" auto-width @click.stop>
              <MenuJurisprudencia
                :favorito="props.row.favorito"
                @on-edit="abrirEdicao(props.row)"
                @on-open-source="abrirFonte(props.row)"
                @on-delete="confirmarExclusao(props.row)"
              />
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width flex flex-center q-pa-md text-grey-6">
            Nenhuma jurisprudência salva ainda.
          </div>
        </template>
      </q-table>

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>

    <PdfViewerDialog
      v-model="pdfDialog"
      :arquivo="arquivoSelecionado"
      :pdf-data="pdfData"
      :loading="pdfLoading"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useQuasar, debounce, type QTableColumn } from 'quasar'
import { useRouter } from 'vue-router'
import { useJurisprudenciaService } from '@/services'
import { useNotification } from '@/composables/useNotification'
import { useAbrirArquivoJurisprudencia } from '@/composables/useAbrirArquivoJurisprudencia'
import { formatarData } from '@/utils/date'
import MenuJurisprudencia from '@/components/jurisprudencias/MenuJurisprudencia.vue'
import PdfViewerDialog from '@/components/documentos/PdfViewerDialog.vue'
import type { Jurisprudencia } from '@/types/jurisprudencias/Jurisprudencia'

const jurisprudenciaService = useJurisprudenciaService()
const notification = useNotification()
const $q = useQuasar()
const router = useRouter()
const { pdfDialog, pdfLoading, pdfData, arquivoSelecionado, abrirArquivo } = useAbrirArquivoJurisprudencia()

const jurisprudencias = ref<Jurisprudencia[]>([])
const isLoading = ref(true)
const more = ref(false)
const page = ref(1)
const rpp = 20

const filters = reactive({
  termo: '',
  tribunal: '',
  tipoAcao: null as string | null,
  favorito: false,
})

const tipoAcaoOptions = [
  { label: 'Cível', value: 'CIVEL' },
  { label: 'Trabalhista', value: 'TRABALHISTA' },
  { label: 'Criminal', value: 'CRIMINAL' },
  { label: 'Tributário', value: 'TRIBUTARIO' },
  { label: 'Família', value: 'FAMILIA' },
  { label: 'Consumidor', value: 'CONSUMIDOR' },
  { label: 'Outros', value: 'OUTROS' },
]

const columns: QTableColumn[] = [
  { name: 'favorito', field: 'favorito', label: '', align: 'center' },
  { name: 'titulo', field: 'titulo', label: 'Título', align: 'left', sortable: true },
  { name: 'tribunal', field: 'tribunal', label: 'Tribunal', align: 'left' },
  { name: 'tipoAcao', field: 'tipoAcao', label: 'Tipo de Ação', align: 'left' },
  { name: 'dataJulgamento', field: 'dataJulgamento', label: 'Data', align: 'left' },
  { name: 'origem', field: 'origem', label: 'Fonte', align: 'center' },
  { name: 'acoes', field: 'id', label: '', align: 'right' },
]

async function load() {
  isLoading.value = true
  try {
    const response = await jurisprudenciaService.getAll({
      page: 1,
      rpp,
      ...activeFilters(),
    })
    jurisprudencias.value = response.list
    more.value = response.more
    page.value = response.page
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

function refresh() {
  page.value = 1
  load()
}

async function loadMore(_: number, done: (stop?: boolean) => void) {
  if (!more.value) return done(true)

  try {
    page.value += 1
    const response = await jurisprudenciaService.getAll({
      page: page.value,
      rpp,
      ...activeFilters(),
    })
    jurisprudencias.value = jurisprudencias.value.concat(response.list)
    more.value = response.more
    done()
  } catch (error) {
    console.error(error)
    done(true)
  }
}

function activeFilters() {
  return {
    ...(filters.termo?.trim() && { termo: filters.termo.trim() }),
    ...(filters.tribunal?.trim() && { tribunal: filters.tribunal.trim() }),
    ...(filters.tipoAcao && { tipoAcao: filters.tipoAcao }),
  }
}

watch(filters, debounce(refresh, 500), { deep: true })

onMounted(() => {
  load()
})

function formatTipoAcao(val: string) {
  return tipoAcaoOptions.find(o => o.value === val)?.label ?? val
}

function abrirEdicao(item: Jurisprudencia) {
  router.push({ name: 'jurisprudencia-view', params: { id: item.id } })
}

function abrirFonte(item: Jurisprudencia) {
  if (item.origem !== 'UPLOAD') {
    if (item.link) window.open(item.link, '_blank', 'noopener,noreferrer')
    return
  }

  if (!item.id) return
  abrirArquivo(item.id, item.arquivoNomeOriginal)
}

async function toggleFavorito(item: Jurisprudencia) {
  if (!item.id) return
  try {
    await jurisprudenciaService.update(item.id, { favorito: !item.favorito })
    item.favorito = !item.favorito
  } catch {
    notification.error('Erro ao atualizar favorito.')
  }
}

function confirmarExclusao(item: Jurisprudencia) {
  $q.dialog({
    title: 'Excluir jurisprudência',
    message: `Deseja excluir "${item.titulo}"? Esta ação não pode ser desfeita.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Excluir', color: 'red' },
    persistent: true,
  }).onOk(async () => {
    if (!item.id) return
    try {
      await jurisprudenciaService.remove(item.id)
      jurisprudencias.value = jurisprudencias.value.filter((jurisprudencia) => jurisprudencia.id !== item.id)
      notification.success('Jurisprudência excluída com sucesso.')
    } catch {
      notification.error('Erro ao excluir jurisprudência.')
    }
  })
}
</script>

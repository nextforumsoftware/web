<template>
  <div class="q-pa-md">
    <div
      class="flex justify-between items-center q-mb-sm"
      style="height: 80px"
    >
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Processos</h4>
        <p class="text-terciary q-my-none">Gerencie seus processos</p>
      </div>
      <q-btn
        color="secondary"
        icon="add_circle"
        label="Novo Processo"
        style="max-width: 200px"
        :to="{ name: 'processo-form' }"
      />
    </div>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filters.term"
          outlined
          dense
          bg-color="white"
          placeholder="Buscar por número ou parte contrária..."
          clearable
          clear-icon="close"
        >
          <template #prepend>
            <q-icon
              name="search"
              size="18px"
            />
          </template>
        </q-input>
      </div>

      <div class="col-6 col-md-2">
        <q-select
          v-model="filters.status"
          outlined
          dense
          bg-color="white"
          label="Status"
          clearable
          emit-value
          map-options
          :options="statusOptions"
        />
      </div>

      <div class="col-6 col-md-3">
        <q-select
          v-model="filters.tipoAcaoProcesso"
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
  </div>

  <div class="q-pa-md q-pt-none">
    <div
      v-if="isLoading"
      class="column items-center q-gutter-y-md q-pa-xl"
    >
      <q-spinner-hourglass
        color="primary"
        size="4em"
      />
      <span class="text-grey-8">Carregando processos...</span>
    </div>

    <q-infinite-scroll
      v-else
      :offset="250"
      @load="loadMore"
    >
      <q-table
        flat
        bordered
        :rows="processos"
        :columns="columns"
        row-key="id"
        :hide-bottom="processos.length > 0"
        :pagination="{ rowsPerPage: 0 }"
        @row-click="(_, row) => onEditarProcesso(row)"
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

        <template #body-cell-tipoAcaoProcesso="props">
          <q-td :props="props">
            <span class="text-weight-medium text-grey-9">{{
              formatTipoProcesso(props.row.tipoAcaoProcesso)
            }}</span>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="statusColor(props.row.status)"
              :label="formatStatus(props.row.status)"
            />
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width flex flex-center q-pa-md text-grey-6">
            Nenhum processo encontrado.
          </div>
        </template>
      </q-table>

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots
            color="primary"
            size="40px"
          />
        </div>
      </template>
    </q-infinite-scroll>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { debounce, type QTableColumn } from 'quasar'
import { useProcessoService } from '@/services'
import { useRouter } from 'vue-router'
import type { Processo } from '@/types/processos/Processo'

const processoService = useProcessoService()
const router = useRouter()

const processos = ref<Processo[]>([])
const isLoading = ref(true)
const more = ref(false)
const page = ref(1)
const rpp = 20

const filters = reactive({
  term: '',
  status: null as string | null,
  tipoAcaoProcesso: null as string | null,
})

const statusOptions = [
  { label: 'Andamento', value: 'ANDAMENTO' },
  { label: 'Julgamento', value: 'JULGAMENTO' },
  { label: 'Sentença', value: 'SENTENCA' },
  { label: 'Recurso', value: 'RECURSO' },
  { label: 'Arquivado', value: 'ARQUIVADO' },
]

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
  {
    name: 'numeroProcesso',
    field: 'numeroProcesso',
    label: 'Número Processo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'tipoAcaoProcesso',
    field: 'tipoAcaoProcesso',
    label: 'Tipo Ação',
    align: 'left',
  },
  { name: 'status', field: 'status', label: 'Status', align: 'left' },
]

async function load() {
  isLoading.value = true
  try {
    const response = await processoService.getAll({
      page: 1,
      rpp,
      ...activeFilters(),
    })
    processos.value = response.list
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
    const response = await processoService.getAll({
      page: page.value,
      rpp,
      ...activeFilters(),
    })
    processos.value = processos.value.concat(response.list)
    more.value = response.more
    done()
  } catch (error) {
    console.error(error)
    done(true)
  }
}

function activeFilters() {
  return {
    ...(filters.term?.trim() && { term: filters.term.trim() }),
    ...(filters.status && { status: filters.status }),
    ...(filters.tipoAcaoProcesso && {
      tipoAcaoProcesso: filters.tipoAcaoProcesso,
    }),
  }
}

watch(filters, debounce(refresh, 500), { deep: true })

onMounted(() => {
  load()
})

function onEditarProcesso(processo: Processo | null) {
  if (!processo) return
  router.push({ name: 'processo-view', params: { id: processo.id } })
}

function formatTipoProcesso(val: string) {
  return tipoAcaoOptions.find((o) => o.value === val)?.label ?? val
}

function formatStatus(val: string) {
  return statusOptions.find((o) => o.value === val)?.label ?? val
}

function statusColor(val: string) {
  const map: Record<string, string> = {
    ANDAMENTO: 'primary',
    JULGAMENTO: 'secondary',
    SENTENCA: 'accent',
    RECURSO: 'negative',
    ARQUIVADO: 'grey-6',
  }
  return map[val] ?? 'grey-6'
}
</script>

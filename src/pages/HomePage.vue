<template>
  <div class="q-pa-md">
    <div
      class="flex justify-between items-center q-mb-lg"
      style="height: 80px"
    >
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Home</h4>
        <p class="text-terciary text-bold q-my-none">
          Bem vindo ao <span class="text-primary">NEXTFORUM</span>
        </p>
      </div>
    </div>

    <div
      v-if="isLoading"
      class="column items-center q-gutter-y-md q-pa-xl"
    >
      <q-spinner-hourglass
        color="primary"
        size="4em"
      />
      <span class="text-grey-8">Carregando painel...</span>
    </div>

    <template v-else>
      <div class="row q-col-gutter-md q-mb-lg">
        <div
          v-for="card in statsCards"
          :key="card.value"
          class="col-6 col-sm-4 col-md-2"
        >
          <div class="stat-card">
            <div
              class="stat-card__icon-wrapper"
              :style="{ background: `${card.color}1A` }"
            >
              <q-icon
                :name="card.icon"
                size="22px"
                :style="{ color: card.color }"
              />
            </div>
            <div
              class="stat-card__number"
              :style="{ color: card.color }"
            >
              {{ card.total }}
            </div>
            <div class="stat-card__label">{{ card.label }}</div>
          </div>
        </div>
      </div>

      <div class="deadlines-card">
        <div class="deadlines-card__header">
          <div class="deadlines-card__icon-wrapper">
            <q-icon
              name="schedule"
              size="20px"
              style="color: #616161"
            />
          </div>
          <span class="deadlines-card__title">Próximos prazos</span>
          <q-space />
          <q-btn
            flat
            dense
            no-caps
            label="Ver todos"
            color="primary"
            :to="{ name: 'prazos' }"
          />
        </div>

        <div
          v-if="proximosPrazos.length === 0"
          class="text-grey-6 q-pa-lg text-center"
        >
          Nenhum prazo pendente registrado.
        </div>

        <q-table
          v-else
          flat
          :rows="proximosPrazos"
          :columns="columns"
          row-key="id"
          hide-bottom
          class="deadlines-table"
          @row-click="(_, row) => irParaProcesso(row)"
        >
          <template #header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="bg-grey-1 text-grey-8"
                style="font-weight: 600"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template #body-cell-prazo="props">
            <q-td :props="props">
              <span
                class="prazo-date"
                :class="prazoUrgenciaClass(props.row.status, props.row.data)"
              >
                {{ formatarData(props.row.data) }}
              </span>
              <span class="prazo-hint text-grey-6 q-ml-sm">
                {{ prazoUrgenciaLabel(props.row.status, props.row.data) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-processo="props">
            <q-td :props="props">
              <span class="text-grey-8">{{
                props.row.processo?.numeroProcesso ?? '-'
              }}</span>
            </q-td>
          </template>

          <template #body-cell-tipo="props">
            <q-td :props="props">
              <span class="text-grey-8">{{
                prazoTipoLabel(props.row.tipo)
              }}</span>
            </q-td>
          </template>
        </q-table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { type QTableColumn } from 'quasar'
import { useProcessoService, usePrazoService } from '@/services'
import type { Prazo } from '@/types/prazos/Prazo'
import { formatarData } from '@/utils/date'
import {
  prazoTipoLabel,
  prazoUrgenciaClass,
  prazoUrgenciaLabel,
} from '@/utils/prazo'

const router = useRouter()
const processoService = useProcessoService()
const prazoService = usePrazoService()

const isLoading = ref(true)
const stats = ref<{ status: string; total: number }[]>([])
const proximosPrazos = ref<Prazo[]>([])

const statusOptions = [
  { label: 'Andamento', value: 'ANDAMENTO', color: '#003366', icon: 'gavel' },
  {
    label: 'Julgamento',
    value: 'JULGAMENTO',
    color: '#C6A75E',
    icon: 'balance',
  },
  {
    label: 'Sentença',
    value: 'SENTENCA',
    color: '#8B5E3C',
    icon: 'description',
  },
  { label: 'Recurso', value: 'RECURSO', color: '#C10015', icon: 'replay' },
  { label: 'Arquivado', value: 'ARQUIVADO', color: '#757575', icon: 'archive' },
]

const statsCards = computed(() =>
  statusOptions.map((opt) => ({
    ...opt,
    total: stats.value.find((stat) => stat.status === opt.value)?.total ?? 0,
  })),
)

const columns: QTableColumn[] = [
  { name: 'titulo', field: 'titulo', label: 'Prazo', align: 'left' },
  { name: 'processo', field: 'processo', label: 'Processo', align: 'left' },
  { name: 'tipo', field: 'tipo', label: 'Tipo', align: 'left' },
  { name: 'prazo', field: 'data', label: 'Vencimento', align: 'left' },
]

async function load() {
  try {
    const [dashboardProcessos, dashboardPrazos] = await Promise.all([
      processoService.getDashboard(),
      prazoService.getDashboard(),
    ])
    stats.value = dashboardProcessos.stats
    proximosPrazos.value = dashboardPrazos.proximosPrazos
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

function irParaProcesso(prazo: Prazo) {
  if (!prazo.processo) return
  router.push({ name: 'processo-view', params: { id: prazo.processo.id } })
}

onMounted(() => load())
</script>

<style scoped>
/* ── Stat cards ── */
.stat-card {
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s;
}

.stat-card:hover {
  border-color: #bdbdbd;
}

.stat-card__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.stat-card__number {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.stat-card__label {
  font-size: 13px;
  color: #212121;
  font-weight: 600;
  font-variant: small-caps;
  text-transform: lowercase;
}

.deadlines-card {
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  overflow: hidden;
}

.deadlines-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.deadlines-card__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #6161611a;
}

.deadlines-card__title {
  font-size: 15px;
  font-weight: 600;
  color: #424242;
}

.deadlines-table {
  cursor: pointer;
}

.prazo-date {
  font-weight: 600;
  font-size: 13px;
}

.prazo-date--vencido {
  color: #c10015;
}
.prazo-date--urgente {
  color: #c10015;
}
.prazo-date--atencao {
  color: #c6a75e;
}
.prazo-date--ok {
  color: #424242;
}

.prazo-hint {
  font-size: 12px;
}
</style>

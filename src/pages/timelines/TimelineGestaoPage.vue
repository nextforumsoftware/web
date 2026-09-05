<template>
  <div class="q-pa-md">
    <div class="q-mb-md">
      <q-btn
        flat
        dense
        no-caps
        icon="arrow_back"
        label="Timelines"
        color="grey-7"
        :to="{ name: 'timelines' }"
      />
    </div>

    <div
      v-if="loading"
      class="column items-center q-gutter-y-md q-pa-xl"
    >
      <q-spinner-hourglass
        color="primary"
        size="4em"
      />
      <span class="text-grey-8">Carregando...</span>
    </div>

    <template v-else>
      <div class="processo-banner q-mb-lg">
        <div class="row items-start justify-between q-col-gutter-md">
          <div class="col-12 col-sm">
            <p class="banner-label q-mb-xs">Número do processo</p>
            <div class="text-h6 text-weight-bold text-grey-9 q-mb-xs">
              {{ processo?.numeroProcesso }}
            </div>
            <div class="row items-center q-gutter-x-sm wrap">
              <span
                class="status-label"
                :class="`status-label--${processo?.status?.toLowerCase()}`"
              >
                {{ statusLabel(processo?.status) }}
              </span>
              <span class="text-grey-4">·</span>
              <span class="text-caption text-grey-6">{{
                tipoAcaoLabel(processo?.tipoAcaoProcesso)
              }}</span>
              <template v-if="processo?.instancia">
                <span class="text-grey-4">·</span>
                <span class="text-caption text-grey-6">{{
                  instanciaLabel(processo.instancia)
                }}</span>
              </template>
            </div>
            <div
              v-if="processo?.parteContraria || processo?.comarca"
              class="row q-gutter-x-lg q-mt-sm"
            >
              <div
                v-if="processo?.parteContraria"
                class="detail-item"
              >
                <span class="banner-label">Parte contrária</span>
                <span class="text-grey-8 text-caption">{{
                  processo.parteContraria
                }}</span>
              </div>
              <div
                v-if="processo?.comarca"
                class="detail-item"
              >
                <span class="banner-label">Comarca</span>
                <span class="text-grey-8 text-caption">{{
                  processo.comarca
                }}</span>
              </div>
              <div
                v-if="processo?.vara"
                class="detail-item"
              >
                <span class="banner-label">Vara</span>
                <span class="text-grey-8 text-caption">{{
                  processo.vara
                }}</span>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-auto row items-center q-gutter-sm">
            <q-btn
              flat
              dense
              no-caps
              icon="event_available"
              color="grey-7"
              label="Prazos do processo"
              :to="{ name: 'prazos', query: { processoId } }"
            />
            <q-btn
              flat
              dense
              no-caps
              icon="share"
              color="grey-7"
              label="Copiar link"
              @click="copiarLink"
            />
            <q-btn
              unelevated
              color="primary"
              icon="add"
              label="Novo evento"
              no-caps
              @click="abrirFormulario()"
            />
          </div>
        </div>
      </div>

      <q-table
        flat
        bordered
        :rows="eventosSorted"
        :columns="columns"
        row-key="id"
        :hide-bottom="eventosSorted.length > 0"
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

        <template #body-cell-data="props">
          <q-td :props="props">
            <span class="text-grey-8 text-caption">{{
              formatarData(props.row.data)
            }}</span>
          </q-td>
        </template>

        <template #body-cell-tipo="props">
          <q-td :props="props">
            <span
              class="tipo-chip"
              :style="{
                background: tipoEventoColorHex(props.row.tipo) + '18',
                color: tipoEventoColorHex(props.row.tipo),
              }"
            >
              {{ tipoEventoLabel(props.row.tipo) }}
            </span>
          </q-td>
        </template>

        <template #body-cell-titulo="props">
          <q-td :props="props">
            <span class="text-weight-medium text-grey-9">{{
              props.row.titulo
            }}</span>
            <div
              v-if="props.row.descricao"
              class="text-caption text-grey-5 ellipsis"
              style="max-width: 320px"
            >
              {{ props.row.descricao }}
            </div>
          </q-td>
        </template>

        <template #body-cell-acoes="props">
          <q-td
            :props="props"
            auto-width
          >
            <div class="row no-wrap q-gutter-xs">
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="edit"
                color="grey-6"
                @click="abrirFormulario(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="delete_outline"
                color="negative"
                @click="confirmarExclusao(props.row)"
              >
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column items-center q-pa-xl text-grey-5">
            <q-icon
              name="pending_actions"
              size="4em"
            />
            <p class="q-mt-md text-body2 text-center">
              Nenhum evento registrado ainda.<br />Adicione o primeiro para
              começar o histórico.
            </p>
            <q-btn
              unelevated
              color="primary"
              icon="add"
              label="Adicionar evento"
              no-caps
              @click="abrirFormulario()"
            />
          </div>
        </template>
      </q-table>
    </template>
  </div>

  <EventoFormDialog
    v-model="dialogAberto"
    :processo-id="processoId"
    :evento="editandoEvento"
    @saved="onSalvo"
  />

  <q-dialog v-model="dialogExclusao">
    <q-card style="min-width: 340px">
      <q-card-section>
        <div class="text-h6">Excluir evento?</div>
        <p class="text-grey-7 q-mt-sm q-mb-none">
          "<strong>{{ eventoParaExcluir?.titulo }}</strong
          >" será removido permanentemente.
        </p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Cancelar"
          v-close-popup
        />
        <q-btn
          unelevated
          no-caps
          color="negative"
          label="Excluir"
          :loading="excluindo"
          @click="excluirEvento"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { type QTableColumn } from 'quasar'
import { useProcessoService, useTimelineService } from '@/services'
import { useNotification } from '@/composables/useNotification'
import type { TimelineEvento } from '@/types/timelines/TimelineEvento'
import EventoFormDialog from '@/components/timelines/EventoFormDialog.vue'
import { tipoEventoColorHex, tipoEventoLabel } from '@/utils/timeline'
import { formatarData } from '@/utils/date'

const route = useRoute()
const processoService = useProcessoService()
const timelineService = useTimelineService()
const notification = useNotification()

const processoId = route.params.processoId as string

const loading = ref(false)
const excluindo = ref(false)
const dialogAberto = ref(false)
const dialogExclusao = ref(false)

const processo = ref<any>(null)
const eventos = ref<TimelineEvento[]>([])
const editandoEvento = ref<TimelineEvento | null>(null)
const eventoParaExcluir = ref<TimelineEvento | null>(null)

const eventosSorted = computed(() =>
  [...eventos.value].sort(
    (eventoA, eventoB) =>
      new Date(eventoB.data).getTime() - new Date(eventoA.data).getTime(),
  ),
)

const columns: QTableColumn[] = [
  { name: 'data', field: 'data', label: 'Data', align: 'left', sortable: true },
  { name: 'tipo', field: 'tipo', label: 'Tipo', align: 'left' },
  { name: 'titulo', field: 'titulo', label: 'Evento', align: 'left' },
  { name: 'acoes', field: 'id', label: '', align: 'right' },
]

function statusLabel(status: string) {
  const map: Record<string, string> = {
    ANDAMENTO: 'Andamento',
    JULGAMENTO: 'Julgamento',
    SENTENCA: 'Sentença',
    RECURSO: 'Recurso',
    ARQUIVADO: 'Arquivado',
  }
  return map[status] ?? status
}

function tipoAcaoLabel(tipo: string) {
  const map: Record<string, string> = {
    CIVEL: 'Cível',
    TRABALHISTA: 'Trabalhista',
    CRIMINAL: 'Criminal',
    TRIBUTARIO: 'Tributário',
    FAMILIA: 'Família',
    CONSUMIDOR: 'Consumidor',
    OUTROS: 'Outros',
  }
  return map[tipo] ?? tipo
}

function instanciaLabel(instancia: string) {
  const map: Record<string, string> = {
    PRIMEIRA: '1ª Instância',
    SEGUNDA: '2ª Instância',
    STJ: 'STJ',
    STF: 'STF',
    TST: 'TST',
  }
  return map[instancia] ?? instancia
}

function abrirFormulario(evento?: TimelineEvento) {
  editandoEvento.value = evento ?? null
  dialogAberto.value = true
}

function onSalvo(evento: TimelineEvento) {
  const indice = eventos.value.findIndex((item) => item.id === evento.id)

  if (indice === -1) {
    eventos.value.push(evento)
    return
  }

  eventos.value[indice] = evento
}

function confirmarExclusao(evento: TimelineEvento) {
  eventoParaExcluir.value = evento
  dialogExclusao.value = true
}

async function excluirEvento() {
  if (!eventoParaExcluir.value) return
  excluindo.value = true
  try {
    await timelineService.remove(eventoParaExcluir.value.id)
    eventos.value = eventos.value.filter(
      (evento) => evento.id !== eventoParaExcluir.value!.id,
    )
    notification.success('Evento excluído.')
    dialogExclusao.value = false
  } catch {
    notification.error('Erro ao excluir evento.')
  } finally {
    excluindo.value = false
  }
}

async function copiarLink() {
  const url = `${window.location.origin}/timeline/publica/${processoId}`
  try {
    await navigator.clipboard.writeText(url)
    notification.success(
      'Link copiado! Envie ao cliente — a senha são os 4 últimos dígitos do processo.',
    )
  } catch {
    notification.error('Não foi possível copiar o link.')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const [proc, evts] = await Promise.all([
      processoService.getById(processoId),
      timelineService.listByProcesso(processoId),
    ])
    processo.value = proc
    eventos.value = evts
  } catch {
    notification.error('Erro ao carregar dados do processo.')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.processo-banner {
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  padding: 24px;
}

.banner-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 2px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-label {
  font-size: 13px;
  font-weight: 600;
}
.status-label--andamento {
  color: #003366;
}
.status-label--julgamento {
  color: #c6a75e;
}
.status-label--sentenca {
  color: #8b5e3c;
}
.status-label--recurso {
  color: #c10015;
}
.status-label--arquivado {
  color: #757575;
}

.tipo-chip {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
  white-space: nowrap;
}
</style>

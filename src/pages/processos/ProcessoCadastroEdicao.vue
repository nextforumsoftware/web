<template>
  <div class="q-pa-md">
    <div
      class="flex justify-between items-center q-mb-sm"
      style="height: 80px"
    >
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">
          {{ editMode ? 'Editar Processo' : 'Novo Processo' }}
        </h4>
      </div>
    </div>

    <q-tabs
      v-if="editMode"
      v-model="tab"
      dense
      align="left"
      active-color="primary"
      class="text-grey q-mb-md"
    >
      <q-tab
        name="informacoes"
        label="Informações"
        no-caps
      />
      <q-tab
        name="prazos"
        label="Prazos"
        no-caps
      />
    </q-tabs>

    <q-tab-panels
      v-model="tab"
      animated
      keep-alive
    >
      <q-tab-panel
        name="informacoes"
        class="q-pa-none"
      >
        <div
          class="bg-white q-pa-lg"
          style="border: 0.4px solid gray"
        >
          <q-form
            ref="formRef"
            @submit.prevent="handleSubmit"
          >
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <InputTextComponent
                  v-model="formData.numeroProcesso"
                  label="Número do Processo"
                  dense
                  outlined
                  :rules="[(val) => requiredField(val, 'Número do Processo')]"
                />
              </div>

              <div class="col-6">
                <SelectComponent
                  v-model="formData.clienteId"
                  label="Cliente*"
                  :options="clientes"
                  option-value="id"
                  option-label="nome"
                  :rules="[(val) => requiredField(val, 'Cliente')]"
                />
              </div>

              <div class="col-6">
                <InputTextComponent
                  v-model="formData.parteContraria"
                  label="Parte Contrária"
                  dense
                  outlined
                />
              </div>

              <div class="col-6">
                <SelectComponent
                  v-model="formData.tipoAcaoProcesso"
                  label="Tipo de Ação*"
                  :options="tipoAcao"
                  option-value="value"
                  option-label="title"
                  :rules="[(val) => requiredField(val, 'Tipo de Ação')]"
                />
              </div>

              <div class="col-6">
                <SelectComponent
                  v-model="formData.status"
                  label="Status*"
                  :options="status"
                  option-value="value"
                  option-label="title"
                  :rules="[(val) => requiredField(val, 'Status')]"
                />
              </div>

              <div class="col-6">
                <SelectComponent
                  v-model="formData.instancia"
                  label="Instância"
                  :options="instancias"
                  option-value="value"
                  option-label="title"
                />
              </div>

              <div class="col-4">
                <InputTextComponent
                  v-model="formData.comarca"
                  label="Comarca"
                  dense
                  outlined
                />
              </div>

              <div class="col-4">
                <InputTextComponent
                  v-model="formData.vara"
                  label="Vara"
                  dense
                  outlined
                />
              </div>

              <div class="col-4">
                <SelectComponent
                  v-model="formData.esferaProcesso"
                  label="Esfera*"
                  :options="esferasProcesso"
                  option-value="value"
                  option-label="title"
                  :rules="[(val) => requiredField(val, 'Esfera')]"
                />
              </div>

              <div class="col-6">
                <InputDateComponent
                  v-model="formData.dataDistribuicao"
                  label="Data de Distribuição"
                  dense
                  outlined
                />
              </div>

              <div class="col-6">
                <InputMoneyComponent
                  v-model="formData.valorCausa"
                  label="Valor da Causa"
                  dense
                  outlined
                />
              </div>

              <q-input
                v-model="formData.descricao"
                label="Descreva o caso ou situação jurídica"
                type="textarea"
                rows="4"
                outlined
                dense
                class="q-mb-md col"
              />
            </div>

            <div class="row justify-end q-mt-lg">
              <q-btn
                color="primary"
                size="small"
                :label="'Cancelar'"
                class="q-mr-sm"
                flat
                :to="{ name: 'processos' }"
              />

              <q-btn
                color="green"
                size="small"
                :label="editMode ? 'Atualizar' : 'Cadastrar'"
                type="submit"
                :loading="isLoading"
              />
            </div>
          </q-form>
        </div>
      </q-tab-panel>

      <q-tab-panel
        v-if="editMode"
        name="prazos"
        class="q-pa-none"
      >
        <ProcessoPrazosTab :processo-id="idProcesso!" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { QForm } from 'quasar'
import { useNotification } from '@/composables/useNotification'
import InputDateComponent from '@/components/InputDateComponent.vue'
import InputMoneyComponent from '@/components/InputMoneyComponent.vue'
import InputTextComponent from '@/components/InputTextComponent.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import ProcessoPrazosTab from '@/components/prazos/ProcessoPrazosTab.vue'
import type { Cliente } from '@/types/clientes/Cliente'
import { useClienteService, useProcessoService } from '@/services'
import { isoToBr, brToIso } from '@/utils/date'
import { getApiErrorMessage } from '@/utils/apiError'

const route = useRoute()
const router = useRouter()
const processoService = useProcessoService()
const clienteService = useClienteService()
const notification = useNotification()

const tab = ref('informacoes')
const editMode = ref(false)
const idProcesso = ref<string>()
const clientes = ref<Cliente[]>([])
const formRef = ref<InstanceType<typeof QForm> | null>(null)
const isLoading = ref(false)

const formData = ref({
  id: '',
  numeroProcesso: '',
  clienteId: '',
  parteContraria: '',
  tipoAcaoProcesso: null as string | null,
  instancia: null as string | null,
  esferaProcesso: null as string | null,
  status: null as string | null,
  vara: '',
  comarca: '',
  dataDistribuicao: null as string | null,
  valorCausa: null as number | null,
  descricao: null as string | null,
})

const status = [
  { title: 'Andamento', value: 'ANDAMENTO' },
  { title: 'Julgamento', value: 'JULGAMENTO' },
  { title: 'Sentença', value: 'SENTENCA' },
  { title: 'Recurso', value: 'RECURSO' },
  { title: 'Arquivado', value: 'ARQUIVADO' },
]

const instancias = [
  { title: '1ª Instância', value: 'PRIMEIRA' },
  { title: '2ª Instância', value: 'SEGUNDA' },
  { title: 'STJ', value: 'STJ' },
  { title: 'STF', value: 'STF' },
  { title: 'TST', value: 'TST' },
]

const tipoAcao = [
  { title: 'Cível', value: 'CIVEL' },
  { title: 'Trabalhista', value: 'TRABALHISTA' },
  { title: 'Criminal', value: 'CRIMINAL' },
  { title: 'Tributário', value: 'TRIBUTARIO' },
  { title: 'Família', value: 'FAMILIA' },
  { title: 'Consumidor', value: 'CONSUMIDOR' },
  { title: 'Outros', value: 'OUTROS' },
]

const esferasProcesso = [
  { title: 'Administrativo', value: 'ADMINISTRATIVO' },
  { title: 'Judicial', value: 'JUDICIAL' },
]

function requiredField(val: any, fieldName = 'Campo'): boolean | string {
  return !!val || `${fieldName} é obrigatório`
}

onMounted(async () => {
  const idRota = route.params.id as string

  if (idRota) {
    editMode.value = true
    idProcesso.value = idRota

    const response = await processoService.getById(idRota)

    formData.value = {
      ...response,
      dataDistribuicao: isoToBr(response.dataDistribuicao),
    }
  }

  const clientesResponse = await clienteService.getAll({ page: 1, rpp: 100 })
  clientes.value = clientesResponse.list
})

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
      await updateProcesso()
    } else {
      await createProcesso()
    }
  } finally {
    isLoading.value = false
  }
}

async function createProcesso() {
  try {
    await processoService.create({
      ...formData.value,
      valorCausa: Number(formData.value.valorCausa),
      dataDistribuicao: formData.value.dataDistribuicao
        ? brToIso(formData.value.dataDistribuicao)
        : null,
    })
    notification.success('Processo cadastrado com sucesso!')
    router.push({ name: 'processos' })
  } catch (error: any) {
    if (error.response) {
      notification.error(
        'Não foi possível realizar o cadastro. Erro: ' +
          getApiErrorMessage(error),
        9000,
      )
      console.error('ERRO', error.data)
    }
  }
}

async function updateProcesso() {
  if (!idProcesso.value) return

  try {
    await processoService.update(idProcesso.value, {
      ...formData.value,
      valorCausa: Number(formData.value.valorCausa),
      dataDistribuicao: formData.value.dataDistribuicao
        ? brToIso(formData.value.dataDistribuicao)
        : null,
    })
    notification.success('Processo atualizado com sucesso!')
  } catch (error: any) {
    if (error.response) {
      notification.error(
        'Não foi possível realizar a atualização. Erro: ' +
          getApiErrorMessage(error),
        9000,
      )
      console.error('ERRO', error.data)
    }
  }
}
</script>

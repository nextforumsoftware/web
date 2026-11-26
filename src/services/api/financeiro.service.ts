import { useApi } from '@/composables/useApi'
import type {
  DashboardFinanceiro,
  Honorario,
  NovoHonorarioPayload,
  PagamentoPayload,
  ParcelaHonorario,
  ParcelaPayload,
  StatusParcelaEnum,
} from '@/types/financeiro/Honorario'

type Paginado<T> = { list: T[]; more: boolean; page: number; rpp: number }

export function useFinanceiroService() {
  const api = useApi()

  async function getDashboard(): Promise<DashboardFinanceiro> {
    const response = await api.get('/financeiro/dashboard')
    return response.data
  }

  async function getHonorarios(params = {}): Promise<Paginado<Honorario>> {
    const response = await api.get('/financeiro/honorarios', { params })
    return response.data
  }

  async function getHonorario(id: string): Promise<Honorario> {
    const response = await api.get(`/financeiro/honorarios/${id}`)
    return response.data
  }

  async function createHonorario(data: NovoHonorarioPayload): Promise<Honorario> {
    const response = await api.post('/financeiro/honorarios', data)
    return response.data
  }

  async function updateHonorario(
    id: string,
    data: NovoHonorarioPayload,
  ): Promise<Honorario> {
    const response = await api.put(`/financeiro/honorarios/${id}`, data)
    return response.data
  }

  async function removeHonorario(id: string): Promise<void> {
    await api.delete(`/financeiro/honorarios/${id}`)
  }

  async function getParcelas(params = {}): Promise<Paginado<ParcelaHonorario>> {
    const response = await api.get('/financeiro/parcelas', { params })
    return response.data
  }

  async function createParcela(
    honorarioId: string,
    data: ParcelaPayload,
  ): Promise<ParcelaHonorario> {
    const response = await api.post(
      `/financeiro/honorarios/${honorarioId}/parcelas`,
      data,
    )
    return response.data
  }

  async function updateParcela(
    id: string,
    data: ParcelaPayload,
  ): Promise<ParcelaHonorario> {
    const response = await api.put(`/financeiro/parcelas/${id}`, data)
    return response.data
  }

  async function registrarPagamento(
    id: string,
    data: PagamentoPayload,
  ): Promise<ParcelaHonorario> {
    const response = await api.patch(`/financeiro/parcelas/${id}/pagamento`, data)
    return response.data
  }

  async function updateStatusParcela(
    id: string,
    status: StatusParcelaEnum,
  ): Promise<ParcelaHonorario> {
    const response = await api.patch(`/financeiro/parcelas/${id}/status`, {
      status,
    })
    return response.data
  }

  async function removeParcela(id: string): Promise<void> {
    await api.delete(`/financeiro/parcelas/${id}`)
  }

  return {
    getDashboard,
    getHonorarios,
    getHonorario,
    createHonorario,
    updateHonorario,
    removeHonorario,
    getParcelas,
    createParcela,
    updateParcela,
    registrarPagamento,
    updateStatusParcela,
    removeParcela,
  }
}

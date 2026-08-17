import { useApi } from '@/composables/useApi'
import { createBaseService } from './base.service'
import type { Prazo, PrazoDashboard, StatusPrazo } from '@/types/prazos/Prazo'

export function usePrazoService() {
  const api = useApi()
  const baseService = createBaseService('/prazos')

  async function getDashboard(): Promise<PrazoDashboard> {
    const response = await api.get('/prazos/dashboard')
    return response.data
  }

  async function updateStatus(id: string, status: StatusPrazo): Promise<Prazo> {
    const response = await api.patch(`/prazos/${id}/status`, { status })
    return response.data
  }

  return {
    ...baseService,
    getDashboard,
    updateStatus,
  }
}

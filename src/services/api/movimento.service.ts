import { useApi } from '@/composables/useApi'
import type { MovimentoProcesso } from '@/types/processos/MovimentoProcesso'

type ListaMovimentos = {
  list: MovimentoProcesso[]
  more: boolean
  page: number
  rpp: number
}

export function useMovimentoService() {
  const api = useApi()

  async function listByProcesso(
    processoId: string,
  ): Promise<MovimentoProcesso[]> {
    const response = await api.get(`/processos/${processoId}/movimentos`)
    return response.data
  }

  async function getAll(params = {}): Promise<ListaMovimentos> {
    const response = await api.get('/processos/movimentos', { params })
    return response.data
  }

  async function sincronizar(
    processoId: string,
  ): Promise<{ inseridos: number }> {
    const response = await api.post(
      `/processos/${processoId}/movimentos/sincronizar`,
    )
    return response.data
  }

  return { listByProcesso, getAll, sincronizar }
}

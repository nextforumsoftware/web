import { createBaseService } from "./base.service"
import { useApi } from "@/composables/useApi"

export function usePeticaoService() {
  const baseService = createBaseService('/peticoes')
  const api = useApi()

  async function gerarComIA(tipo: string, prompt: string, signal?: AbortSignal) {
    const response = await api.post('/peticoes/gerar-ia', { tipo, prompt }, { signal })
    return response.data.conteudo as string
  }

  return {
    ...baseService,
    gerarComIA,
  }
}
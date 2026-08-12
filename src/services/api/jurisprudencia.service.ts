import { useApi } from "@/composables/useApi"
import { createBaseService } from "./base.service"

export function useJurisprudenciaService() {
  const api = useApi()
  const baseService = createBaseService('/jurisprudencias')

  async function create(data: Record<string, any>, arquivo?: File) {
    if (!arquivo) {
      const response = await api.post('/jurisprudencias', data)
      return response.data
    }

    const formData = new FormData()
    Object.entries(data).forEach(([campo, valor]) => {
      if (valor !== null && valor !== undefined) formData.append(campo, String(valor))
    })
    formData.append('arquivo', arquivo)

    const response = await api.post('/jurisprudencias', formData)
    return response.data
  }

  async function download(id: string): Promise<ArrayBuffer> {
    const response = await api.get(`/jurisprudencias/${id}/download`, {
      responseType: 'arraybuffer',
    })
    return response.data
  }

  return {
    ...baseService,
    create,
    download,
  }
}

import { useApi } from "@/composables/useApi"
import { createBaseService } from "./base.service"

export function useArquivoService(resource?: any) {
  const api = useApi()

  const baseService = createBaseService('/arquivos')

  async function getAllByPasta(pastaId: string) {
    try {
      const response = await api.get(`/arquivos/${pastaId}`, { data: resource })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async function getPresignedUrl(arquivoId: string): Promise<string> {
    const response = await api.get(`/arquivos/${arquivoId}/presigned-url`)
    return response.data.url
  }

  async function download(arquivoId: string): Promise<ArrayBuffer> {
    const response = await api.get(`/arquivos/${arquivoId}/download`, {
      responseType: 'arraybuffer',
    })
    return response.data
  }

  async function upload(pastaId: string, file: File) {
    const formData = new FormData()
    formData.append('pastaId', pastaId)
    formData.append('file', file)

    const response = await api.post('/arquivos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000
    })
    return response.data
  }


  return {
    ...baseService,
    getAllByPasta,
    getPresignedUrl,
    download,
    upload
  }
}
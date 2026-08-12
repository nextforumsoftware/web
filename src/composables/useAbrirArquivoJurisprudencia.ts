import { ref } from 'vue'
import { useJurisprudenciaService } from '@/services'
import { useNotification } from '@/composables/useNotification'

export function useAbrirArquivoJurisprudencia() {
  const jurisprudenciaService = useJurisprudenciaService()
  const notification = useNotification()

  const pdfDialog = ref(false)
  const pdfLoading = ref(false)
  const pdfData = ref<ArrayBuffer | null>(null)
  const arquivoSelecionado = ref<{ nome: string } | null>(null)

  async function abrirArquivo(id: string, nomeOriginal?: string | null) {
    const nome = nomeOriginal ?? 'documento'
    const isPdf = nome.toLowerCase().endsWith('.pdf')

    if (isPdf) {
      arquivoSelecionado.value = { nome }
      pdfData.value = null
      pdfDialog.value = true
      pdfLoading.value = true
      try {
        pdfData.value = await jurisprudenciaService.download(id)
      } catch {
        notification.error('Erro ao carregar arquivo.')
      } finally {
        pdfLoading.value = false
      }
      return
    }

    try {
      const data = await jurisprudenciaService.download(id)
      const blob = new Blob([data])
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = nome
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      notification.error('Erro ao baixar arquivo.')
    }
  }

  return { pdfDialog, pdfLoading, pdfData, arquivoSelecionado, abrirArquivo }
}

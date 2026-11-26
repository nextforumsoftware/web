import { useQuasar } from 'quasar'
import { useFinanceiroService } from '@/services'
import { useNotification } from '@/composables/useNotification'
import { getApiErrorMessage } from '@/utils/apiError'
import {
  StatusParcelaEnum,
  type ParcelaHonorario,
} from '@/types/financeiro/Honorario'

type Confirmacao = {
  titulo: string
  mensagem: string
  rotuloOk: string
  mensagemSucesso: string
  acao: () => Promise<unknown>
}

export function useAcoesParcela(onAlterada: () => void) {
  const $q = useQuasar()
  const financeiroService = useFinanceiroService()
  const notification = useNotification()

  async function executar(acao: () => Promise<unknown>, mensagemSucesso: string) {
    try {
      await acao()
      notification.success(mensagemSucesso)
      onAlterada()
    } catch (error) {
      notification.error(getApiErrorMessage(error, 'Erro ao atualizar parcela.'))
    }
  }

  function confirmar(confirmacao: Confirmacao) {
    $q.dialog({
      title: confirmacao.titulo,
      message: confirmacao.mensagem,
      cancel: { label: 'Voltar', flat: true, noCaps: true },
      ok: { label: confirmacao.rotuloOk, color: 'negative', noCaps: true },
      persistent: true,
    }).onOk(() => executar(confirmacao.acao, confirmacao.mensagemSucesso))
  }

  function estornar(parcela: ParcelaHonorario) {
    confirmar({
      titulo: 'Estornar pagamento',
      mensagem: `O pagamento da parcela ${parcela.numero} será desfeito e ela volta a ficar em aberto.`,
      rotuloOk: 'Estornar',
      mensagemSucesso: 'Pagamento estornado.',
      acao: () => financeiroService.updateStatusParcela(parcela.id, StatusParcelaEnum.PENDENTE),
    })
  }

  function cancelar(parcela: ParcelaHonorario) {
    confirmar({
      titulo: 'Cancelar parcela',
      mensagem: `A parcela ${parcela.numero} deixa de ser cobrada e sai dos totais.`,
      rotuloOk: 'Cancelar parcela',
      mensagemSucesso: 'Parcela cancelada.',
      acao: () => financeiroService.updateStatusParcela(parcela.id, StatusParcelaEnum.CANCELADA),
    })
  }

  function reativar(parcela: ParcelaHonorario) {
    executar(
      () => financeiroService.updateStatusParcela(parcela.id, StatusParcelaEnum.PENDENTE),
      'Parcela reativada.',
    )
  }

  function excluir(parcela: ParcelaHonorario) {
    confirmar({
      titulo: 'Excluir parcela',
      mensagem: `A parcela ${parcela.numero} será removida permanentemente.`,
      rotuloOk: 'Excluir',
      mensagemSucesso: 'Parcela excluída.',
      acao: () => financeiroService.removeParcela(parcela.id),
    })
  }

  return { estornar, cancelar, reativar, excluir }
}

export enum TipoHonorarioEnum {
  CONTRATUAL = 'CONTRATUAL',
  EXITO = 'EXITO',
  SUCUMBENCIA = 'SUCUMBENCIA',
  MENSALIDADE = 'MENSALIDADE',
  CONSULTA = 'CONSULTA',
  OUTROS = 'OUTROS',
}

export enum StatusParcelaEnum {
  PENDENTE = 'PENDENTE',
  PAGA = 'PAGA',
  CANCELADA = 'CANCELADA',
}

export enum SituacaoParcelaEnum {
  A_VENCER = 'A_VENCER',
  ATRASADA = 'ATRASADA',
  PAGA = 'PAGA',
  CANCELADA = 'CANCELADA',
}

export enum FiltroSituacaoParcelaEnum {
  EM_ABERTO = 'EM_ABERTO',
  A_VENCER = 'A_VENCER',
  ATRASADA = 'ATRASADA',
  PAGA = 'PAGA',
  CANCELADA = 'CANCELADA',
}

export enum FormaPagamentoEnum {
  PIX = 'PIX',
  BOLETO = 'BOLETO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  CARTAO = 'CARTAO',
  DINHEIRO = 'DINHEIRO',
  OUTROS = 'OUTROS',
}

export const TipoHonorarioSettings = {
  CONTRATUAL: {
    label: 'Contratual',
    value: TipoHonorarioEnum.CONTRATUAL,
    color: 'blue-1',
    textColor: 'blue-9',
  },
  EXITO: {
    label: 'Êxito',
    value: TipoHonorarioEnum.EXITO,
    color: 'amber-1',
    textColor: 'amber-10',
  },
  SUCUMBENCIA: {
    label: 'Sucumbência',
    value: TipoHonorarioEnum.SUCUMBENCIA,
    color: 'purple-1',
    textColor: 'purple-8',
  },
  MENSALIDADE: {
    label: 'Mensalidade',
    value: TipoHonorarioEnum.MENSALIDADE,
    color: 'teal-1',
    textColor: 'teal-9',
  },
  CONSULTA: {
    label: 'Consulta',
    value: TipoHonorarioEnum.CONSULTA,
    color: 'cyan-1',
    textColor: 'cyan-9',
  },
  OUTROS: {
    label: 'Outros',
    value: TipoHonorarioEnum.OUTROS,
    color: 'grey-2',
    textColor: 'grey-8',
  },
}

export const SituacaoParcelaSettings = {
  A_VENCER: {
    label: 'A vencer',
    value: SituacaoParcelaEnum.A_VENCER,
    color: 'blue-1',
    textColor: 'blue-9',
  },
  ATRASADA: {
    label: 'Atrasada',
    value: SituacaoParcelaEnum.ATRASADA,
    color: 'red-1',
    textColor: 'red-8',
  },
  PAGA: {
    label: 'Paga',
    value: SituacaoParcelaEnum.PAGA,
    color: 'green-1',
    textColor: 'green-8',
  },
  CANCELADA: {
    label: 'Cancelada',
    value: SituacaoParcelaEnum.CANCELADA,
    color: 'grey-2',
    textColor: 'grey-7',
  },
}

export const FiltroSituacaoParcelaSettings = {
  EM_ABERTO: { label: 'Em aberto', value: FiltroSituacaoParcelaEnum.EM_ABERTO },
  A_VENCER: { label: 'A vencer', value: FiltroSituacaoParcelaEnum.A_VENCER },
  ATRASADA: { label: 'Atrasadas', value: FiltroSituacaoParcelaEnum.ATRASADA },
  PAGA: { label: 'Pagas', value: FiltroSituacaoParcelaEnum.PAGA },
  CANCELADA: { label: 'Canceladas', value: FiltroSituacaoParcelaEnum.CANCELADA },
}

export const FormaPagamentoSettings = {
  PIX: { label: 'Pix', value: FormaPagamentoEnum.PIX },
  BOLETO: { label: 'Boleto', value: FormaPagamentoEnum.BOLETO },
  TRANSFERENCIA: { label: 'Transferência', value: FormaPagamentoEnum.TRANSFERENCIA },
  CARTAO: { label: 'Cartão', value: FormaPagamentoEnum.CARTAO },
  DINHEIRO: { label: 'Dinheiro', value: FormaPagamentoEnum.DINHEIRO },
  OUTROS: { label: 'Outros', value: FormaPagamentoEnum.OUTROS },
}

export function getTipoHonorarioSettings(tipo: TipoHonorarioEnum) {
  return TipoHonorarioSettings[tipo]
}

export function getSituacaoParcelaSettings(situacao: SituacaoParcelaEnum) {
  return SituacaoParcelaSettings[situacao]
}

export function getFormaPagamentoSettings(forma?: FormaPagamentoEnum | null) {
  if (!forma) return undefined

  return FormaPagamentoSettings[forma]
}

export interface ParcelaHonorario {
  id: string
  honorarioId: string
  honorario?: Pick<Honorario, 'id' | 'descricao' | 'tipo' | 'cliente' | 'processo'>
  numero: number
  valor: number
  vencimento: string
  status: StatusParcelaEnum
  situacao: SituacaoParcelaEnum
  dataPagamento?: string | null
  valorPago?: number | null
  formaPagamento?: FormaPagamentoEnum | null
  observacoes?: string | null
  createdAt: string
}

export interface ResumoHonorario {
  valorTotal: number
  valorRecebido: number
  valorEmAberto: number
  valorEmAtraso: number
  quantidadeParcelas: number
  quantidadePagas: number
  quantidadeAtrasadas: number
}

export interface Honorario {
  id: string
  clienteId: string
  cliente?: { id: string; nome: string }
  processoId?: string | null
  processo?: { id: string; numeroProcesso: string } | null
  descricao: string
  tipo: TipoHonorarioEnum
  percentualExito?: number | null
  observacoes?: string | null
  parcelas: ParcelaHonorario[]
  resumo: ResumoHonorario
  createdAt: string
}

export interface NovoHonorarioPayload {
  clienteId: string
  processoId: string | null
  descricao: string
  tipo: TipoHonorarioEnum
  percentualExito: number | null
  observacoes: string
  valorTotal?: number
  numeroParcelas?: number
  primeiroVencimento?: string
}

export interface ParcelaPayload {
  valor: number
  vencimento: string
  observacoes: string
}

export interface PagamentoPayload {
  dataPagamento: string
  valorPago: number
  formaPagamento: FormaPagamentoEnum | null
}

export interface DashboardFinanceiro {
  emAberto: number
  emAtraso: number
  quantidadeEmAtraso: number
  aVencer30Dias: number
  recebidoNoMes: number
}

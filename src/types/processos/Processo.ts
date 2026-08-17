import type { StatusProcessoEnum } from './StatusProcessoEnum'
import type { InstanciaProcessoEnum } from './InstanciaProcessoEnum'
import type { EsferaProcessoEnum } from './EsferaProcessoEnum'

export interface Processo {
  id: string
  numeroProcesso: string
  clienteId?: string
  tipoAcaoProcesso?: string
  status: StatusProcessoEnum
  instancia?: InstanciaProcessoEnum
  parteContraria?: string
  vara?: boolean
  comarca?: string
  dataDistribuicao?: Date
  valorCausa?: number
  descricao?: string
  observacoes?: string
  caso?: string
  esferaProcesso: EsferaProcessoEnum
}

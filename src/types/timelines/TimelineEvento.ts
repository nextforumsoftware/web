export type TipoEvento =
  | 'AUDIENCIA'
  | 'SENTENCA'
  | 'RECURSO'
  | 'DESPACHO'
  | 'PROTOCOLO'
  | 'PERICIA'
  | 'ACORDO'
  | 'OUTROS'

export interface TimelineEvento {
  id: string
  processoId: string
  titulo: string
  descricao?: string
  tipo: TipoEvento
  data: string
  movimentoId?: string | null
  createdAt: string
}

export interface EventoSugerido {
  titulo: string
  tipo: TipoEvento
  data: string
  movimentoId: string
}

export interface TimelineResumo {
  id: string
  numeroProcesso: string
  status: string
  tipoAcaoProcesso: string
  parteContraria?: string
  totalEventos: number
  ultimoEvento: { titulo: string; tipo: TipoEvento; data: string } | null
}

export interface TimelinePublica {
  processo: {
    numeroProcesso: string
    status: string
    tipoAcaoProcesso: string
    cliente?: string
  }
  eventos: TimelineEvento[]
}

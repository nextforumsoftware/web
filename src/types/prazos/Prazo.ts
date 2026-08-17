export type TipoPrazo = 'FATAL' | 'ORDINATORIO' | 'AUDIENCIA' | 'OUTROS'
export type StatusPrazo = 'PENDENTE' | 'CUMPRIDO' | 'PERDIDO'

export interface Prazo {
  id: string
  processoId: string
  processo?: { id: string; numeroProcesso: string }
  titulo: string
  tipo: TipoPrazo
  data: string
  status: StatusPrazo
  responsavelId?: string | null
  responsavel?: { id: string; nome: string } | null
  observacoes?: string
  createdAt: string
}

export interface PrazoDashboard {
  pendentes: number
  vencidos: number
  proximos7Dias: number
  proximosPrazos: Prazo[]
}

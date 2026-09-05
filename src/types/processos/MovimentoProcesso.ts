export interface DetalheMovimento {
  id: string
  movimentoId: string
  codigo: number
  valor: number
  nome: string
  descricao: string
}

export interface MovimentoProcesso {
  id: string
  processoId: string
  codigo: number
  nome: string
  dataHora: string
  orgaoJulgadorCodigo?: string
  orgaoJulgadorNome?: string
  detalhes?: DetalheMovimento[]
  processo?: {
    id: string
    numeroProcesso: string
    cliente?: { id: string; nome: string }
  }
  naTimeline: boolean
  createdAt: string
}

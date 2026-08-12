export interface Jurisprudencia {
  id?: string
  titulo: string
  tribunal?: string | null
  numeroProcesso?: string | null
  ementa?: string | null
  tema?: string | null
  dataJulgamento?: string | null
  relator?: string | null
  orgaoJulgador?: string | null
  tipoAcao?: string | null
  anotacaoPessoal?: string | null
  favorito?: boolean
  origem?: string
  link?: string | null
  arquivoUrl?: string | null
  arquivoNomeOriginal?: string | null
  createdAt?: string
}

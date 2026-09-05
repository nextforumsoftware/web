import type { DetalheMovimento } from '@/types/processos/MovimentoProcesso'
import type { TipoEvento } from '@/types/timelines/TimelineEvento'

export function complementoLabel(detalhe: DetalheMovimento): string {
  const rotulo = (detalhe.descricao ?? '').replace(/_/g, ' ').trim()
  if (!rotulo) return detalhe.nome ?? ''
  if (!detalhe.nome) return capitalizar(rotulo)

  return `${capitalizar(rotulo)}: ${detalhe.nome}`
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const REGRAS_TIPO_EVENTO: { padrao: RegExp; tipo: TipoEvento }[] = [
  {
    padrao: /audi[êe]ncia|concilia[çc][ãa]o|instru[çc][ãa]o e julgamento/i,
    tipo: 'AUDIENCIA',
  },
  { padrao: /acordo|homologa/i, tipo: 'ACORDO' },
  {
    padrao: /senten[çc]a|julgad[oa]|m[ée]rito|proced[êe]ncia/i,
    tipo: 'SENTENCA',
  },
  { padrao: /recurso|apela[çc][ãa]o|agravo|embargos/i, tipo: 'RECURSO' },
  { padrao: /per[íi]cia|laudo|perito/i, tipo: 'PERICIA' },
  { padrao: /peti[çc][ãa]o|protocol|distribui|juntada/i, tipo: 'PROTOCOLO' },
  { padrao: /despacho|decis[ãa]o|ato ordinat[óo]rio/i, tipo: 'DESPACHO' },
]

export function tipoEventoSugerido(nomeMovimento: string): TipoEvento {
  const regra = REGRAS_TIPO_EVENTO.find((item) =>
    item.padrao.test(nomeMovimento ?? ''),
  )
  return regra?.tipo ?? 'OUTROS'
}

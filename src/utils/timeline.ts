import type { TipoEvento } from '@/types/timelines/TimelineEvento'

export const TIPOS_EVENTO: { label: string; value: TipoEvento }[] = [
  { label: 'Audiência', value: 'AUDIENCIA' },
  { label: 'Sentença', value: 'SENTENCA' },
  { label: 'Recurso', value: 'RECURSO' },
  { label: 'Despacho', value: 'DESPACHO' },
  { label: 'Protocolo', value: 'PROTOCOLO' },
  { label: 'Perícia', value: 'PERICIA' },
  { label: 'Acordo', value: 'ACORDO' },
  { label: 'Outros', value: 'OUTROS' },
]

export function tipoEventoLabel(tipo: string): string {
  return TIPOS_EVENTO.find((item) => item.value === tipo)?.label ?? tipo
}

export function tipoEventoColorHex(tipo: string): string {
  const map: Record<string, string> = {
    AUDIENCIA: '#003366',
    SENTENCA: '#7B1FA2',
    RECURSO: '#C10015',
    DESPACHO: '#00796B',
    PROTOCOLO: '#546E7A',
    PERICIA: '#283593',
    ACORDO: '#2E7D32',
    OUTROS: '#757575',
  }
  return map[tipo] ?? '#757575'
}

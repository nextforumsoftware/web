import type { StatusPrazo, TipoPrazo } from '@/types/prazos/Prazo'
import { parseSafeDate } from './date'

export const TIPOS_PRAZO: { label: string; value: TipoPrazo }[] = [
  { label: 'Fatal', value: 'FATAL' },
  { label: 'Ordinatório', value: 'ORDINATORIO' },
  { label: 'Audiência', value: 'AUDIENCIA' },
  { label: 'Outros', value: 'OUTROS' },
]

export const STATUS_PRAZO: { label: string; value: StatusPrazo }[] = [
  { label: 'Pendente', value: 'PENDENTE' },
  { label: 'Cumprido', value: 'CUMPRIDO' },
  { label: 'Perdido', value: 'PERDIDO' },
]

export function prazoTipoLabel(tipo: string): string {
  return TIPOS_PRAZO.find((item) => item.value === tipo)?.label ?? tipo
}

export function prazoTipoColorHex(tipo: string): string {
  const map: Record<string, string> = {
    FATAL: '#C10015',
    ORDINATORIO: '#003366',
    AUDIENCIA: '#C6A75E',
    OUTROS: '#757575',
  }
  return map[tipo] ?? '#757575'
}

export function prazoStatusLabel(status: string): string {
  return STATUS_PRAZO.find((item) => item.value === status)?.label ?? status
}

export function prazoStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDENTE: 'primary',
    CUMPRIDO: 'positive',
    PERDIDO: 'negative',
  }
  return map[status] ?? 'grey-6'
}

function diasRestantes(data: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const prazo = parseSafeDate(data)
  prazo.setHours(0, 0, 0, 0)
  return Math.round((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export function prazoUrgenciaClass(status: string, data: string): string {
  if (status !== 'PENDENTE') return 'prazo-date--ok'
  const dias = diasRestantes(data)
  if (dias < 0) return 'prazo-date--vencido'
  if (dias <= 7) return 'prazo-date--urgente'
  if (dias <= 15) return 'prazo-date--atencao'
  return 'prazo-date--ok'
}

export function prazoUrgenciaLabel(status: string, data: string): string {
  if (status !== 'PENDENTE') return ''
  const dias = diasRestantes(data)
  if (dias < 0) return `venceu há ${Math.abs(dias)} dia(s)`
  if (dias === 0) return 'vence hoje'
  if (dias === 1) return 'vence amanhã'
  return `${dias} dias`
}

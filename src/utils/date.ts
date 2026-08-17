export function parseSafeDate(date: string): Date {
  return new Date(date.split('T')[0] + 'T12:00:00')
}

export function isoToBr(date: string | null | undefined): string {
  if (!date) return ''
  const [isoDate = ''] = date.split('T')
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return ''
  return `${day}/${month}/${year}`
}

export function brToIso(date: string): string {
  if (!date) return ''
  return date.split('/').reverse().join('-')
}

export function formatarDatetime(date: string): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  })
}

export function formatarData(date: string): string {
  if (!date) return ''
  return parseSafeDate(date).toLocaleDateString('pt-BR')
}

export function formatarDataAbreviada(date: string): string {
  if (!date) return ''
  return parseSafeDate(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatarDataLonga(date: string): string {
  if (!date) return ''
  return parseSafeDate(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatarMesAno(date: string): string {
  if (!date) return ''
  return parseSafeDate(date).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatarMoeda(valor: number | null | undefined): string {
  return formatadorMoeda.format(valor ?? 0)
}

export function paraValorDoInput(valor: number | null | undefined): string {
  return (valor ?? 0).toFixed(2)
}

export function todayIso(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

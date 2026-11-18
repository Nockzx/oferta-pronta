/** Divide um valor em reais em parte inteira (com milhar) e centavos: 1299.9 → ["1.299", "90"] */
export function partesPreco(valor: number): [string, string] {
  const centavosTotais = Math.round(valor * 100)
  const inteiro = Math.floor(centavosTotais / 100)
  const centavos = centavosTotais % 100
  return [inteiro.toLocaleString('pt-BR'), String(centavos).padStart(2, '0')]
}

export function reais(valor: number): string {
  return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** (62) 99123-4567 a partir de qualquer string com dígitos. */
export function telefone(v: string): string {
  const d = v.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return v
}

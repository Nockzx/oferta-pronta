/** Pontos de uma explosão (starburst) num viewBox 200×200. */
export function explosao(pontas = 20, rExterno = 98, rInterno = 82): string {
  const pts: string[] = []
  for (let i = 0; i < pontas * 2; i++) {
    const r = i % 2 ? rInterno : rExterno
    const a = (Math.PI * i) / pontas - Math.PI / 2
    pts.push(`${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

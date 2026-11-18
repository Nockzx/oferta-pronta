/**
 * Design system das ARTES (não da interface do app).
 * Toda arte é desenhada numa prancheta de 1080 de largura; as medidas abaixo
 * são "unidades de arte" (px nessa base). A exportação multiplica por pixelRatio.
 */

export const FONTES = {
  preco: "'Anton', Impact, sans-serif",
  display: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  corpo: "'Barlow', system-ui, sans-serif",
} as const

/** Escala tipográfica — razão 1.333 (quarta justa). */
export const TIPO = { xs: 20, sm: 24, md: 32, lg: 42, xl: 56, '2xl': 75, '3xl': 100, '4xl': 133 } as const

/** Escala de preço — independente, pensada para leitura no feed e a 3 m (impresso). */
export const PRECO = { xs: 64, sm: 96, md: 150, lg: 220, xl: 320 } as const

/** Espaçamento base 8. */
export const ESPACO = { 1: 8, 2: 16, 3: 24, 4: 32, 6: 48, 8: 64, 12: 96, 16: 128 } as const

export const RAIO = { sm: 10, md: 18, lg: 32 } as const

export const SOMBRA = {
  adesivo: '0 10px 0 rgba(0,0,0,.22), 0 22px 40px rgba(0,0,0,.25)',
  card: '0 4px 0 rgba(0,0,0,.08), 0 18px 36px -12px rgba(0,0,0,.35)',
  produto: 'drop-shadow(0 28px 22px rgba(0,0,0,.35))',
} as const

/** Cor de alerta fixa (urgência e risco de preço antigo). Não depende da marca. */
export const ALERTA = '#E11D48'
export const VERDE_WHATS = '#1FAF54'

export type Formato = 'feed' | 'story' | 'a4'

export interface EspecFormato {
  id: Formato
  nome: string
  largura: 1080
  altura: number
  /** multiplicador na exportação para chegar à resolução final */
  pixelRatio: number
  margem: number
  /** áreas cobertas pela interface do Instagram/WhatsApp */
  seguro: { topo: number; base: number }
}

export const FORMATOS: Record<Formato, EspecFormato> = {
  feed: { id: 'feed', nome: 'Feed 1080×1080', largura: 1080, altura: 1080, pixelRatio: 1, margem: 64, seguro: { topo: 0, base: 0 } },
  story: { id: 'story', nome: 'Story 1080×1920', largura: 1080, altura: 1920, pixelRatio: 1, margem: 64, seguro: { topo: 220, base: 300 } },
  // A4 = 210×297 mm → 2480×3508 px a 300 dpi
  a4: { id: 'a4', nome: 'A4 impressão', largura: 1080, altura: 1527, pixelRatio: 2480 / 1080, margem: 72, seguro: { topo: 0, base: 0 } },
}

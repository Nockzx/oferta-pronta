/**
 * Utilidades de cor sem dependências: sRGB ↔ OKLab ↔ OKLCH, contraste WCAG 2.x
 * e ajuste de luminosidade preservando o matiz.
 * OKLab é perceptualmente uniforme: distâncias e ajustes de "L" se comportam como o olho espera.
 */

export type RGB = [number, number, number] // 0–255
export type Lab = [number, number, number] // L 0–1, a, b
export type LCH = [number, number, number] // L 0–1, C ≥ 0, H em graus

const lim = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/* ------------------------------- hex ------------------------------- */
export function hexParaRgb(hex: string): RGB {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h.slice(0, 6), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function rgbParaHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map((v) => Math.round(lim(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase()
}

export function hexValido(hex: string): boolean {
  return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex.trim())
}

/* ------------------------------ sRGB ------------------------------- */
const paraLinear = (c: number) => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const deLinear = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)

/* ------------------------------ OKLab ------------------------------ */
export function rgbParaOklab([r, g, b]: RGB): Lab {
  const lr = paraLinear(r), lg = paraLinear(g), lb = paraLinear(b)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

/** Converte para RGB linear (pode sair do intervalo 0–1 se estiver fora do gamut). */
function oklabParaLinear([L, a, b]: Lab): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

export function oklabParaRgb(lab: Lab): RGB {
  const [r, g, b] = oklabParaLinear(lab)
  return [deLinear(lim(r, 0, 1)), deLinear(lim(g, 0, 1)), deLinear(lim(b, 0, 1))]
}

export function labParaLch([L, a, b]: Lab): LCH {
  const C = Math.hypot(a, b)
  let H = (Math.atan2(b, a) * 180) / Math.PI
  if (H < 0) H += 360
  return [L, C, H]
}

export function lchParaLab([L, C, H]: LCH): Lab {
  const r = (H * Math.PI) / 180
  return [L, C * Math.cos(r), C * Math.sin(r)]
}

function noGamut(lab: Lab): boolean {
  return oklabParaLinear(lab).every((v) => v >= -0.0001 && v <= 1.0001)
}

/** OKLCH → hex, reduzindo o croma (mantendo L e H) até caber em sRGB. */
export function lchParaHex([L, C, H]: LCH): string {
  L = lim(L, 0, 1)
  if (noGamut(lchParaLab([L, C, H]))) return rgbParaHex(oklabParaRgb(lchParaLab([L, C, H])))
  let lo = 0, hi = C
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2
    if (noGamut(lchParaLab([L, m, H]))) lo = m
    else hi = m
  }
  return rgbParaHex(oklabParaRgb(lchParaLab([L, lo, H])))
}

export const hexParaLch = (hex: string): LCH => labParaLch(rgbParaOklab(hexParaRgb(hex)))

/** Distância perceptual (ΔE em OKLab). */
export function distancia(a: Lab, b: Lab): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

/** Diferença angular de matiz, 0–180. */
export function difMatiz(h1: number, h2: number): number {
  const d = Math.abs(h1 - h2) % 360
  return d > 180 ? 360 - d : d
}

/* ------------------------------ WCAG ------------------------------- */
export function luminanciaRelativa(hex: string): number {
  const [r, g, b] = hexParaRgb(hex).map(paraLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contraste(hex1: string, hex2: string): number {
  const a = luminanciaRelativa(hex1), b = luminanciaRelativa(hex2)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** AA: 4,5:1 para texto comum; 3:1 para texto grande (≥ 24 px, ou ≥ 18,66 px negrito). */
export const AA_NORMAL = 4.5
export const AA_GRANDE = 3

/**
 * Ajusta a luminosidade (OKLCH L) de `cor` até atingir `alvo` de contraste contra `outra`,
 * preservando matiz. Testa escurecer e clarear e escolhe a menor mudança possível.
 * Retorna a própria cor se já atende.
 */
export function ajustarParaContraste(cor: string, outra: string, alvo: number): string {
  if (contraste(cor, outra) >= alvo) return cor
  const [L, C, H] = hexParaLch(cor)
  const tentar = (direcao: -1 | 1): string | null => {
    for (let passo = 1; passo <= 100; passo++) {
      const novoL = L + direcao * passo * 0.01
      if (novoL < 0 || novoL > 1) return null
      const hex = lchParaHex([novoL, C, H])
      if (contraste(hex, outra) >= alvo) return hex
    }
    return null
  }
  const escuro = tentar(-1), claro = tentar(1)
  if (escuro && claro) {
    return Math.abs(hexParaLch(escuro)[0] - L) <= Math.abs(hexParaLch(claro)[0] - L) ? escuro : claro
  }
  return escuro ?? claro ?? cor
}

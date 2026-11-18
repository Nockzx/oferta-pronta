import { distancia, labParaLch, oklabParaRgb, rgbParaHex, rgbParaOklab, type Lab, type LCH } from './cor'

export interface CorExtraida {
  hex: string
  lab: Lab
  lch: LCH
  /** fração da área colorida da logo (0–1) */
  peso: number
}

/* ---------------------------------------------------------------------------
 * k-means em OKLab (puro, testável sem navegador)
 * ------------------------------------------------------------------------- */

/** PRNG determinístico: a mesma logo sempre gera a mesma paleta. */
function mulberry32(semente: number) {
  return () => {
    semente |= 0
    semente = (semente + 0x6d2b79f5) | 0
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function kmeans(pontos: Lab[], k: number, iteracoes = 24): { centro: Lab; n: number }[] {
  if (pontos.length === 0) return []
  k = Math.min(k, pontos.length)
  const rnd = mulberry32(42)

  // inicialização k-means++
  const centros: Lab[] = [pontos[Math.floor(rnd() * pontos.length)]]
  const d2 = new Float64Array(pontos.length)
  while (centros.length < k) {
    let soma = 0
    for (let i = 0; i < pontos.length; i++) {
      let m = Infinity
      for (const c of centros) m = Math.min(m, distancia(pontos[i], c) ** 2)
      d2[i] = m
      soma += m
    }
    if (soma === 0) break
    let alvo = rnd() * soma
    let escolhido = 0
    for (let i = 0; i < pontos.length; i++) {
      alvo -= d2[i]
      if (alvo <= 0) { escolhido = i; break }
    }
    centros.push(pontos[escolhido])
  }

  const rotulo = new Int32Array(pontos.length)
  for (let it = 0; it < iteracoes; it++) {
    let mudou = false
    for (let i = 0; i < pontos.length; i++) {
      let melhor = 0, md = Infinity
      for (let c = 0; c < centros.length; c++) {
        const d = distancia(pontos[i], centros[c])
        if (d < md) { md = d; melhor = c }
      }
      if (rotulo[i] !== melhor) { rotulo[i] = melhor; mudou = true }
    }
    const soma = centros.map(() => [0, 0, 0, 0])
    for (let i = 0; i < pontos.length; i++) {
      const s = soma[rotulo[i]]
      s[0] += pontos[i][0]; s[1] += pontos[i][1]; s[2] += pontos[i][2]; s[3]++
    }
    soma.forEach((s, c) => { if (s[3]) centros[c] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]] })
    if (!mudou && it > 0) break
  }

  const n = new Array(centros.length).fill(0)
  for (let i = 0; i < pontos.length; i++) n[rotulo[i]]++
  return centros.map((centro, i) => ({ centro, n: n[i] })).filter((c) => c.n > 0)
}

/** Agrupa pixels (já filtrados) em cores representativas, unindo grupos quase iguais. */
export function agruparCores(pontos: Lab[], k = 6): CorExtraida[] {
  const grupos = kmeans(pontos, k)
  // une grupos perceptualmente muito próximos (ex.: dois tons do mesmo vermelho por antisserrilhado)
  const unidos: { centro: Lab; n: number }[] = []
  for (const g of grupos.sort((a, b) => b.n - a.n)) {
    const perto = unidos.find((u) => distancia(u.centro, g.centro) < 0.05)
    if (perto) {
      const t = perto.n + g.n
      perto.centro = perto.centro.map((v, i) => (v * perto.n + g.centro[i] * g.n) / t) as Lab
      perto.n = t
    } else unidos.push({ ...g })
  }
  const total = unidos.reduce((s, u) => s + u.n, 0)
  return unidos
    .map((u) => {
      const hex = rgbParaHex(oklabParaRgb(u.centro))
      return { hex, lab: u.centro, lch: labParaLch(u.centro), peso: u.n / total }
    })
    .filter((c) => c.peso >= 0.015)
    .sort((a, b) => b.peso - a.peso)
}

/**
 * Descarta o que não é "cor de marca": transparência, quase-branco (fundo de JPG) e quase-preto puro.
 * Cinzas escuros (ex.: texto da logo) são mantidos — podem virar a cor secundária.
 */
export function pixelUtil(r: number, g: number, b: number, a: number): Lab | null {
  if (a < 200) return null
  const lab = rgbParaOklab([r, g, b])
  const [L] = lab
  const C = Math.hypot(lab[1], lab[2])
  if (L > 0.93 && C < 0.05) return null // branco / quase branco
  if (L < 0.13) return null // preto puro
  return lab
}

/* ---------------------------------------------------------------------------
 * Navegador: carregar a logo e ler os pixels
 * ------------------------------------------------------------------------- */

export async function carregarImagem(src: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.decoding = 'async'
  img.src = src
  await img.decode()
  return img
}

function lerArquivo(arquivo: Blob): Promise<string> {
  return new Promise((ok, erro) => {
    const r = new FileReader()
    r.onload = () => ok(String(r.result))
    r.onerror = () => erro(r.error)
    r.readAsDataURL(arquivo)
  })
}

/**
 * Normaliza a logo para guardar: SVG continua vetorial; PNG/JPG são reduzidos a no máximo 640 px
 * (mantendo transparência). Retorna um data URL.
 */
export async function prepararLogo(arquivo: File): Promise<string> {
  const ehSvg = arquivo.type === 'image/svg+xml' || arquivo.name.toLowerCase().endsWith('.svg')
  const dataUrl = await lerArquivo(arquivo)
  if (ehSvg) return dataUrl
  const img = await carregarImagem(dataUrl)
  const max = 640
  const escala = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
  if (escala === 1 && arquivo.size < 400_000) return dataUrl
  const c = document.createElement('canvas')
  c.width = Math.round(img.naturalWidth * escala)
  c.height = Math.round(img.naturalHeight * escala)
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/png')
}

/** Extrai as cores da logo (data URL ou URL com CORS liberado). */
export async function extrairCores(src: string, k = 6): Promise<CorExtraida[]> {
  const img = await carregarImagem(src)
  const lado = 160
  const w0 = img.naturalWidth || lado, h0 = img.naturalHeight || lado
  const escala = lado / Math.max(w0, h0)
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w0 * escala))
  c.height = Math.max(1, Math.round(h0 * escala))
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, c.width, c.height)
  const { data } = ctx.getImageData(0, 0, c.width, c.height)

  const pontos: Lab[] = []
  for (let i = 0; i < data.length; i += 4) {
    const lab = pixelUtil(data[i], data[i + 1], data[i + 2], data[i + 3])
    if (lab) pontos.push(lab)
  }
  return agruparCores(pontos, k)
}

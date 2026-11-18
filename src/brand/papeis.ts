import { AA_GRANDE, AA_NORMAL, ajustarParaContraste, contraste, difMatiz, distancia, hexParaLch, lchParaHex } from './cor'
import type { CorExtraida } from './extrair'
import type { PapeisCor } from './types'

/** As 5 cores que o cliente vê e pode editar. As cores "sobre" são sempre calculadas. */
export interface PaletaBase {
  primaria: string
  secundaria: string
  destaque: string
  fundo: string
  texto: string
}

export type PapelBase = keyof PaletaBase

export const NOMES_PAPEIS: Record<PapelBase, { nome: string; uso: string }> = {
  primaria: { nome: 'Primária', uso: 'Fundos principais, faixas e títulos' },
  secundaria: { nome: 'Secundária', uso: 'Rodapé, faixas de apoio e selos' },
  destaque: { nome: 'Destaque', uso: 'Preço, explosões e tarjas' },
  fundo: { nome: 'Fundo', uso: 'Áreas claras e cards' },
  texto: { nome: 'Texto', uso: 'Textos sobre o fundo claro' },
}

export const AMARELO_VAREJO = '#FFD200'
export const BRANCO = '#FFFFFF'

const ehCromatica = (c: CorExtraida) => c.lch[1] >= 0.06
const ehAmarelada = (h: number) => difMatiz(h, 95) <= 30

/**
 * Sugere os papéis de cor a partir das cores extraídas da logo.
 * Ordem: primária (maior área colorida) → destaque (cor clara e viva) → secundária (contrasta com a primária).
 */
export function sugerirBase(cores: CorExtraida[]): PaletaBase {
  const cromaticas = cores.filter(ehCromatica).sort((a, b) => b.peso * (0.6 + b.lch[1] * 3) - a.peso * (0.6 + a.lch[1] * 3))
  const neutras = cores.filter((c) => !ehCromatica(c))

  // 1) primária
  const prim = cromaticas[0] ?? neutras.filter((n) => n.lch[0] < 0.55).sort((a, b) => b.peso - a.peso)[0]
  const primHex = prim?.hex ?? '#1F2937'
  const [pL, pC, pH] = prim?.lch ?? hexParaLch(primHex)
  const restantes = cromaticas.filter((c) => c !== prim)

  // 2) destaque: cor clara e saturada que não seja a primária (o "amarelo do preço")
  const candDestaque = restantes
    .filter((c) => c.lch[0] >= 0.72 && c.lch[1] >= 0.1 && distancia(c.lab, prim?.lab ?? [pL, 0, 0]) > 0.12)
    .sort((a, b) => b.lch[1] * b.lch[0] - a.lch[1] * a.lch[0])[0]
  const primClaraAmarela = pL >= 0.7 && ehAmarelada(pH)
  const destaque = candDestaque?.hex ?? (primClaraAmarela ? BRANCO : AMARELO_VAREJO)

  // 3) secundária: outra cor da logo com matiz diferente; senão um neutro escuro da logo; senão derivada
  const candSec = restantes
    .filter((c) => c !== candDestaque && (difMatiz(c.lch[2], pH) >= 30 || Math.abs(c.lch[0] - pL) >= 0.2))
    .sort((a, b) => b.peso - a.peso)[0]
  const neutroEscuro = neutras
    .filter((n) => n !== prim && n.lch[0] < 0.5 && n.peso >= 0.05 && distancia(n.lab, prim?.lab ?? [pL, 0, 0]) > 0.1)
    .sort((a, b) => b.peso - a.peso)[0]
  // derivada: mesmo matiz da primária, mais escura (ou mais clara, se a primária já for escura)
  const Lsec = pL < 0.48 ? pL + 0.2 : Math.max(pL - 0.24, 0.3)
  const secundaria = candSec?.hex ?? neutroEscuro?.hex ?? lchParaHex([Lsec, pC, pH])

  // 4) fundo e texto derivados da primária: mantêm a "temperatura" da marca
  const fundo = lchParaHex([0.975, Math.min(pC, 0.12) * 0.22, pH])
  const texto = lchParaHex([0.21, Math.min(pC, 0.12) * 0.3, pH])

  return { primaria: primHex, secundaria, destaque, fundo, texto }
}

/* ---------------------------------------------------------------------------
 * Contraste: escolhe a cor de texto de cada superfície e corrige o que ficar ilegível
 * ------------------------------------------------------------------------- */

export interface Ajuste {
  papel: PapelBase
  de: string
  para: string
  motivo: string
}

export interface Checagem {
  rotulo: string
  frente: string
  fundo: string
  razao: number
  minimo: number
  ok: boolean
}

export interface PaletaFinal {
  paleta: PapeisCor
  ajustes: Ajuste[]
  checagens: Checagem[]
}

/** Melhor cor de texto (branco ou o texto da marca) para uma superfície. */
function melhorTexto(superficie: string, texto: string): string {
  return contraste(superficie, BRANCO) >= contraste(superficie, texto) ? BRANCO : texto
}

/**
 * Garante que haja texto legível (AA 4,5:1) sobre a superfície.
 * Se nem branco nem o texto da marca passam, ajusta a luminosidade da superfície
 * na direção que exige a menor mudança.
 */
function corrigirSuperficie(sup: string, texto: string): string {
  if (Math.max(contraste(sup, BRANCO), contraste(sup, texto)) >= AA_NORMAL) return sup
  const L0 = hexParaLch(sup)[0]
  const opcoes = [ajustarParaContraste(sup, BRANCO, AA_NORMAL), ajustarParaContraste(sup, texto, AA_NORMAL)]
    .filter((h) => Math.max(contraste(h, BRANCO), contraste(h, texto)) >= AA_NORMAL)
  if (!opcoes.length) return sup
  return opcoes.sort((a, b) => Math.abs(hexParaLch(a)[0] - L0) - Math.abs(hexParaLch(b)[0] - L0))[0]
}

export function finalizarPaleta(base: PaletaBase, corrigir = true): PaletaFinal {
  const ajustes: Ajuste[] = []
  const b = { ...base }

  if (corrigir) {
    // texto precisa ser legível sobre o fundo claro
    const texto = ajustarParaContraste(b.texto, b.fundo, AA_NORMAL)
    if (texto !== b.texto) ajustes.push({ papel: 'texto', de: b.texto, para: texto, motivo: 'texto pouco legível sobre o fundo' })
    b.texto = texto

    for (const papel of ['primaria', 'secundaria', 'destaque'] as const) {
      const nova = corrigirSuperficie(b[papel], b.texto)
      if (nova !== b[papel]) {
        ajustes.push({ papel, de: b[papel], para: nova, motivo: 'nem branco nem preto ficavam legíveis em cima dela' })
        b[papel] = nova
      }
    }
  }

  const paleta: PapeisCor = {
    ...b,
    sobrePrimaria: melhorTexto(b.primaria, b.texto),
    sobreSecundaria: melhorTexto(b.secundaria, b.texto),
    sobreDestaque: melhorTexto(b.destaque, b.texto),
  }

  const chk = (rotulo: string, frente: string, fundo: string, minimo: number): Checagem => {
    const razao = contraste(frente, fundo)
    return { rotulo, frente, fundo, razao, minimo, ok: razao >= minimo }
  }
  const checagens = [
    chk('Texto sobre o fundo', paleta.texto, paleta.fundo, AA_NORMAL),
    chk('Texto sobre a primária', paleta.sobrePrimaria, paleta.primaria, AA_NORMAL),
    chk('Texto sobre a secundária', paleta.sobreSecundaria, paleta.secundaria, AA_NORMAL),
    chk('Preço sobre o destaque', paleta.sobreDestaque, paleta.destaque, AA_NORMAL),
    chk('Primária sobre o fundo (títulos grandes)', paleta.primaria, paleta.fundo, AA_GRANDE),
  ]

  return { paleta, ajustes, checagens }
}

import { describe, expect, it } from 'vitest'
import { contraste, hexParaRgb } from './cor'
import { agruparCores, pixelUtil, type CorExtraida } from './extrair'
import { AMARELO_VAREJO, finalizarPaleta, sugerirBase } from './papeis'

/** Simula os pixels de uma logo: [hex, quantidade] */
function logo(...partes: [string, number][]): CorExtraida[] {
  const pts = partes.flatMap(([hex, n]) => {
    const [r, g, b] = hexParaRgb(hex)
    const lab = pixelUtil(r, g, b, 255)
    return lab ? Array(n).fill(lab) : []
  })
  return agruparCores(pts)
}

describe('extração', () => {
  it('ignora branco, preto puro e transparência', () => {
    expect(pixelUtil(255, 255, 255, 255)).toBeNull()
    expect(pixelUtil(250, 250, 248, 255)).toBeNull()
    expect(pixelUtil(0, 0, 0, 255)).toBeNull()
    expect(pixelUtil(215, 20, 26, 0)).toBeNull()
    expect(pixelUtil(215, 20, 26, 255)).not.toBeNull()
  })

  it('agrupa e ordena por área', () => {
    const cores = logo(['#D7141A', 600], ['#FFD200', 250], ['#FFFFFF', 900], ['#000000', 300])
    expect(cores).toHaveLength(2)
    expect(cores[0].hex).toBe('#D7141A')
    expect(cores[0].peso).toBeCloseTo(600 / 850, 2)
  })
})

describe('papéis de cor', () => {
  it('logo vermelha + amarela: primária vermelha, destaque amarelo', () => {
    const base = sugerirBase(logo(['#D7141A', 600], ['#FFD200', 250], ['#0B3D91', 150]))
    expect(base.primaria).toBe('#D7141A')
    expect(base.destaque).toBe('#FFD200')
    expect(base.secundaria).toBe('#0B3D91')
  })

  it('logo de uma cor só: gera secundária e usa o amarelo de varejo no destaque', () => {
    const base = sugerirBase(logo(['#0F6B3A', 500]))
    expect(base.primaria).toBe('#0F6B3A')
    expect(base.destaque).toBe(AMARELO_VAREJO)
    expect(base.secundaria).not.toBe(base.primaria)
  })

  it('logo preta e branca: primária escura neutra', () => {
    const base = sugerirBase(logo(['#222222', 500], ['#FFFFFF', 500]))
    expect(base.primaria).toBe('#222222')
    expect(base.destaque).toBe(AMARELO_VAREJO)
    expect(base.secundaria).not.toBe(base.primaria)
  })

  it('corrige superfícies sem contraste e todas as checagens passam', () => {
    const { paleta, ajustes, checagens } = finalizarPaleta({
      primaria: '#0F6B3A', secundaria: '#D9534F', destaque: '#FFE14D', fundo: '#F2F7F3', texto: '#10231A',
    })
    expect(ajustes.map((a) => a.papel)).toContain('secundaria')
    expect(contraste(paleta.sobreSecundaria, paleta.secundaria)).toBeGreaterThanOrEqual(4.5)
    expect(checagens.slice(0, 4).every((c) => c.ok)).toBe(true)
  })

  it('sem correção, mantém a cor do cliente e acusa a falha', () => {
    const { paleta, checagens } = finalizarPaleta(
      { primaria: '#0F6B3A', secundaria: '#D9534F', destaque: '#FFE14D', fundo: '#F2F7F3', texto: '#10231A' },
      false,
    )
    expect(paleta.secundaria).toBe('#D9534F')
    expect(checagens.find((c) => c.rotulo.includes('secundária'))!.ok).toBe(false)
  })

  it('toda sugestão automática sai legível', () => {
    const casos: [string, number][][] = [
      [['#FFD200', 700], ['#E30613', 200]],
      [['#7FD1F7', 600]],
      [['#F58220', 500], ['#00A859', 300]],
      [['#6B2C91', 400], ['#F9B000', 200]],
    ]
    for (const c of casos) {
      const { checagens } = finalizarPaleta(sugerirBase(logo(...c)))
      expect(checagens.slice(0, 4).every((k) => k.ok), JSON.stringify(c)).toBe(true)
    }
  })
})


import { describe, expect, it } from 'vitest'
import { ajustarParaContraste, contraste, hexParaLch, hexParaRgb, lchParaHex, oklabParaRgb, rgbParaHex, rgbParaOklab } from './cor'

describe('cor', () => {
  it('converte hex ↔ rgb', () => {
    expect(hexParaRgb('#D7141A')).toEqual([215, 20, 26])
    expect(hexParaRgb('#fff')).toEqual([255, 255, 255])
    expect(rgbParaHex([215, 20, 26])).toBe('#D7141A')
  })

  it('ida e volta em OKLab preserva a cor', () => {
    for (const hex of ['#D7141A', '#0B3D91', '#FFD200', '#0F6B3A', '#777777']) {
      expect(rgbParaHex(oklabParaRgb(rgbParaOklab(hexParaRgb(hex))))).toBe(hex)
    }
  })

  it('calcula contraste WCAG', () => {
    expect(contraste('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
    expect(contraste('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5)
    expect(contraste('#767676', '#FFFFFF')).toBeCloseTo(4.54, 1)
  })

  it('mantém a cor dentro do gamut sRGB ao reduzir croma', () => {
    const hex = lchParaHex([0.9, 0.4, 140])
    expect(hex).toMatch(/^#[0-9A-F]{6}$/)
    expect(hexParaLch(hex)[0]).toBeCloseTo(0.9, 1)
  })

  it('ajusta luminosidade até atingir o contraste, preservando o matiz', () => {
    const laranja = '#F28C00'
    expect(contraste(laranja, '#FFFFFF')).toBeLessThan(4.5)
    const ajustado = ajustarParaContraste(laranja, '#FFFFFF', 4.5)
    expect(contraste(ajustado, '#FFFFFF')).toBeGreaterThanOrEqual(4.5)
    expect(Math.abs(hexParaLch(ajustado)[2] - hexParaLch(laranja)[2])).toBeLessThan(8)
  })
})

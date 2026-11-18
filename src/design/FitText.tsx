import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** tamanho máximo e mínimo da fonte, em unidades de arte */
  max: number
  min?: number
  /** número máximo de linhas */
  linhas?: number
  lineHeight?: number
  style?: CSSProperties
  className?: string
}

/**
 * Texto que encolhe sozinho até caber na largura do pai e no número de linhas.
 * Busca binária no tamanho da fonte; refaz quando as fontes terminam de carregar.
 * Garante que nome de produto longo nunca quebre o layout.
 */
export function FitText({ children, max, min = max * 0.5, linhas = 2, lineHeight = 1, style, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [tamanho, setTamanho] = useState(max)
  const [versaoFontes, setVersaoFontes] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const cabe = (t: number) => {
      el.style.fontSize = `${t}px`
      // folga de meia linha: acentos e descendentes podem exceder a caixa da linha sem criar linha nova
      return el.scrollWidth <= el.clientWidth + 0.5 && el.scrollHeight <= t * lineHeight * (linhas + 0.5)
    }
    let lo = min, hi = max, melhor = min
    if (cabe(max)) melhor = max
    else {
      for (let i = 0; i < 14; i++) {
        const meio = (lo + hi) / 2
        if (cabe(meio)) { melhor = meio; lo = meio } else hi = meio
      }
    }
    el.style.fontSize = `${melhor}px`
    setTamanho(melhor)
  }, [children, max, min, linhas, lineHeight, versaoFontes])

  useLayoutEffect(() => {
    let vivo = true
    document.fonts?.ready.then(() => vivo && setVersaoFontes((v) => v + 1))
    return () => { vivo = false }
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, fontSize: tamanho, lineHeight, overflow: 'hidden', overflowWrap: 'normal', wordBreak: 'normal', textWrap: 'balance' } as CSSProperties}
    >
      {children}
    </div>
  )
}

import type { CSSProperties, ReactNode } from 'react'
import { ALERTA } from './tokens'

/** Tarja inclinada ("SÓ HOJE", "OFERTA DO DIA"). */
export function Tarja({ children, tamanho = 56, alerta, style }: { children: ReactNode; tamanho?: number; alerta?: boolean; style?: CSSProperties }) {
  const cores = alerta ? { '--tbg': ALERTA, '--tc': '#fff' } : {}
  return (
    <span className="op-tarja" style={{ '--ts': `${tamanho}px`, ...cores, ...style } as CSSProperties}>
      <span>{children}</span>
    </span>
  )
}

/** Pílula de categoria/regra ("ATACADO", "MÍN. 5 CX"). */
export function Pilula({ children, tamanho = 28, fundo, cor, ponto = true, style }: { children: ReactNode; tamanho?: number; fundo?: string; cor?: string; ponto?: boolean; style?: CSSProperties }) {
  return (
    <span className="op-pilula" style={{ '--ts': `${tamanho}px`, ...(fundo ? { '--pbg': fundo } : {}), ...(cor ? { '--pcol': cor } : {}), ...style } as CSSProperties}>
      {ponto && <i />}
      {children}
    </span>
  )
}

/** Carimbo circular de condição ("LEVE 12 / PAGUE 10"). */
export function Carimbo({ linha1, linha2, tamanho = 190, style }: { linha1: string; linha2?: string; tamanho?: number; style?: CSSProperties }) {
  return (
    <span className="op-carimbo" style={{ '--cs': `${tamanho}px`, ...style } as CSSProperties}>
      <span>
        {linha1}
        {linha2 && <small>{linha2}</small>}
      </span>
    </span>
  )
}

/** Faixa diagonal no canto superior direito. */
export function FaixaCanto({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div className="op-canto" style={style}>{children}</div>
}

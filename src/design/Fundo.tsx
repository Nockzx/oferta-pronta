import type { CSSProperties } from 'react'

/** Fundo com raios saindo de um ponto focal (cx, cy em %). */
export function FundoRaios({ cx = 50, cy = 46 }: { cx?: number; cy?: number }) {
  return <div className="op-fundo op-fundo-raios" style={{ '--cx': `${cx}%`, '--cy': `${cy}%` } as CSSProperties} />
}

/** Textura de meio-tom que esmaece na direção indicada. */
export function MeioTom({ angulo = 160 }: { angulo?: number }) {
  return <div className="op-meio-tom" style={{ '--ang': `${angulo}deg` } as CSSProperties} />
}

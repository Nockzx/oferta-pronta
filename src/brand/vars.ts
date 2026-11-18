import type { CSSProperties } from 'react'
import type { PapeisCor } from './types'

/** Converte os papéis de cor em variáveis CSS consumidas por design/art.css. */
export function paletaParaVars(p: PapeisCor): CSSProperties {
  return {
    '--p': p.primaria,
    '--s': p.secundaria,
    '--a': p.destaque,
    '--bg': p.fundo,
    '--tx': p.texto,
    '--onp': p.sobrePrimaria,
    '--ons': p.sobreSecundaria,
    '--ona': p.sobreDestaque,
  } as CSSProperties
}

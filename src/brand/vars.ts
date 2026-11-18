import type { CSSProperties } from 'react'
import { AA_GRANDE, contraste } from './cor'
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
    // primária usada como texto/preço sobre o fundo claro: se não tiver contraste (ex.: amarelo), usa o texto
    '--pf': contraste(p.primaria, p.fundo) >= AA_GRANDE ? p.primaria : p.texto,
  } as CSSProperties
}

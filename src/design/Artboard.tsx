import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { paletaParaVars } from '@/brand/vars'
import type { PapeisCor } from '@/brand/types'
import { FORMATOS, type Formato } from './tokens'
import './art.css'

interface ArtboardProps {
  formato: Formato
  paleta: PapeisCor
  children: ReactNode
  /** id usado pelo motor de exportação para localizar o nó */
  id?: string
}

/** Prancheta em tamanho real (1080 × altura do formato). É este nó que vira PNG. */
export function Artboard({ formato, paleta, children, id }: ArtboardProps) {
  const f = FORMATOS[formato]
  return (
    <div id={id} className="op-art" data-formato={formato} style={{ width: f.largura, height: f.altura, ...paletaParaVars(paleta) }}>
      {children}
    </div>
  )
}

/** Mostra a prancheta escalada para caber na largura disponível (prévia ao vivo). */
export function ArtboardPreview({ formato, larguraMax, className, ...rest }: ArtboardProps & { larguraMax?: number; className?: string }) {
  const caixa = useRef<HTMLDivElement>(null)
  const f = FORMATOS[formato]
  const [escala, setEscala] = useState(0.4)

  useLayoutEffect(() => {
    const el = caixa.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setEscala(e.contentRect.width / f.largura))
    ro.observe(el)
    return () => ro.disconnect()
  }, [f.largura])

  return (
    <div ref={caixa} className={className} style={{ width: '100%', maxWidth: larguraMax, alignSelf: 'flex-start', flex: 'none', aspectRatio: `${f.largura} / ${f.altura}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ transform: `scale(${escala})`, transformOrigin: '0 0', position: 'absolute', top: 0, left: 0 }}>
        <Artboard formato={formato} {...rest} />
      </div>
    </div>
  )
}

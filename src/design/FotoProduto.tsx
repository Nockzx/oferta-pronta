import type { CSSProperties } from 'react'

interface Props {
  src?: string
  alt: string
  largura: number
  altura: number
  style?: CSSProperties
}

/**
 * Slot de foto com tamanho fixo. A imagem é contida no slot e apoiada na base,
 * para que produtos de alturas diferentes fiquem na mesma "linha de chão".
 * As imagens chegam aqui já recortadas (sem fundo e sem margem) pelo pipeline de imagens.
 */
export function FotoProduto({ src, alt, largura, altura, style }: Props) {
  return (
    <div className="op-foto" style={{ width: largura, height: altura, '--fh': `${altura}px`, ...style } as CSSProperties}>
      {src ? (
        <img src={src} alt={alt} crossOrigin="anonymous" />
      ) : (
        <div
          style={{
            width: altura * 0.62, height: altura * 0.62, borderRadius: '50%', alignSelf: 'center',
            background: 'color-mix(in oklab, var(--bg) 70%, transparent)', display: 'grid', placeItems: 'center',
            font: `900 ${altura * 0.2}px/1 var(--f-display)`, color: 'var(--p)',
          }}
        >
          {alt.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  )
}

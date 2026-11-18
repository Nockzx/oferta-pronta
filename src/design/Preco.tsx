import type { CSSProperties } from 'react'
import { partesPreco } from '@/lib/formatar'
import { explosao } from './shapes'

export type EstiloPreco = 'livre' | 'bloco' | 'etiqueta' | 'explosao' | 'fita'

interface Props {
  valor: number
  /** tamanho da parte inteira, em unidades de arte */
  tamanho: number
  unidade?: string
  estilo?: EstiloPreco
  /** só para estilo "explosao": diâmetro da estrela */
  diametro?: number
  pontas?: number
  /** sobrescreve a cor dos números (estilo livre) */
  cor?: string
  className?: string
  style?: CSSProperties
}

/**
 * Preço de tabloide: selo "R$" girado, inteiro em Anton, centavos sobrescritos a 46%
 * e unidade abaixo dos centavos. Preços com 3+ dígitos encolhem levemente para caber.
 */
export function Preco({ valor, tamanho, unidade, estilo = 'livre', diametro, pontas = 20, cor, className, style }: Props) {
  const [inteiro, centavos] = partesPreco(valor)
  const digitos = inteiro.replace(/\D/g, '').length
  const ps = digitos >= 4 ? tamanho * 0.7 : digitos === 3 ? tamanho * 0.82 : tamanho

  const numeros = (
    <span className="op-preco" style={{ '--ps': `${ps}px`, ...(cor ? { '--pc': cor } : {}) } as CSSProperties}>
      <span className="rs">R$</span>
      <span className="int">{inteiro}</span>
      <span className="dec">
        <span className="cents">{centavos}</span>
        {unidade && <span className="un">{unidade}</span>}
      </span>
    </span>
  )

  if (estilo === 'livre') return <span className={className} style={style}>{numeros}</span>

  if (estilo === 'explosao') {
    const d = diametro ?? tamanho * 2.6
    return (
      <span className={`op-suporte-explosao ${className ?? ''}`} style={{ width: d, height: d, ...style }}>
        <svg viewBox="0 0 200 200" aria-hidden>
          <polygon points={explosao(pontas)} fill="var(--a)" />
          <polygon points={explosao(pontas, 86, 72)} fill="none" stroke="var(--ona)" strokeOpacity=".18" strokeWidth="1.6" strokeDasharray="4 3" />
        </svg>
        <span style={{ position: 'relative', marginTop: ps * 0.05 }}>{numeros}</span>
      </span>
    )
  }

  return (
    <span className={`op-suporte-${estilo} ${className ?? ''}`} style={{ fontSize: ps, ...style }}>
      {estilo === 'fita' ? <span style={{ display: 'inline-block' }}>{numeros}</span> : numeros}
    </span>
  )
}

export function PrecoAntigo({ valor, tamanho = 30, cor, prefixo = 'De', sufixo }: { valor: number; tamanho?: number; cor?: string; prefixo?: string; sufixo?: string }) {
  const [i, c] = partesPreco(valor)
  return (
    <span className="op-antigo" style={{ '--os': `${tamanho}px`, ...(cor ? { '--oc': cor } : {}) } as CSSProperties}>
      {prefixo} <s>R$ {i},{c}</s>{sufixo ? ` ${sufixo}` : ''}
    </span>
  )
}

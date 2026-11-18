import type { CSSProperties } from 'react'
import type { Marca } from '@/brand/types'
import { telefone } from '@/lib/formatar'

export function iniciais(nome: string): string {
  const ignorar = /^(de|da|do|das|dos|e|mercado|distribuidora|açougue|acougue|hortifruti|supermercado|mercearia)$/i
  const palavras = nome.split(/\s+/).filter((p) => p && !ignorar.test(p))
  return (palavras.length ? palavras : nome.split(/\s+/)).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

export function Logo({ marca, tamanho = 116 }: { marca: Marca; tamanho?: number }) {
  return (
    <div className="op-logo" style={{ '--ls': `${tamanho}px` } as CSSProperties}>
      {marca.logoUrl ? <img src={marca.logoUrl} alt={marca.nome} crossOrigin="anonymous" /> : <b>{iniciais(marca.nome)}</b>}
    </div>
  )
}

export function IconeWhats() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" />
    </svg>
  )
}

export function BotaoWhats({ numero, rotulo, tamanho = 32 }: { numero: string; rotulo?: string; tamanho?: number }) {
  return (
    <span className="op-whats" style={{ '--ws': `${tamanho}px` } as CSSProperties}>
      <IconeWhats />
      {rotulo ?? telefone(numero)}
    </span>
  )
}

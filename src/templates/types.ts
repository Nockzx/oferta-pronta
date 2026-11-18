import type { ComponentType } from 'react'
import type { Marca, Segmento } from '@/brand/types'
import type { Formato } from '@/design/tokens'

export type Categoria = 'oferta-do-dia' | 'semana' | 'tabela-distribuidora' | 'retencao'

export const CATEGORIAS: Record<Categoria, string> = {
  'oferta-do-dia': 'Oferta do dia',
  semana: 'Promoções da semana',
  'tabela-distribuidora': 'Tabela de preços da distribuidora',
  retencao: 'Posts de retenção',
}

export type Unidade = 'un' | 'kg' | 'cx' | 'fardo' | 'pct' | 'dz' | 'l'

export interface ItemOferta {
  id: string
  /** nome curto e forte: "Refrigerante cola" */
  nome: string
  /** complemento: "lata 350 ml", "fardo 6×1,5 L" */
  detalhe?: string
  preco: number
  precoAntigo?: number
  unidade?: Unidade
  /** quantidade na embalagem, para B2B: cx c/12 */
  qtdEmbalagem?: number
  /** URL da imagem já recortada */
  foto?: string
}

export interface CampoManifest {
  id: string
  tipo: 'texto' | 'opcao'
  rotulo: string
  padrao: string
  opcoes?: string[]
}

export interface TemplateManifest {
  id: string
  nome: string
  descricao: string
  categoria: Categoria
  segmentos: Segmento[]
  formatos: Formato[]
  produtos: { min: number; max: number }
  variacoes: { id: string; nome: string }[]
  campos: CampoManifest[]
}

export interface TemplateProps {
  marca: Marca
  itens: ItemOferta[]
  formato: Formato
  variacao: string
  campos: Record<string, string>
}

export interface Template {
  manifest: TemplateManifest
  Componente: ComponentType<TemplateProps>
}

/** Rótulo de unidade exibido abaixo dos centavos. */
export function rotuloUnidade(item: ItemOferta): string | undefined {
  switch (item.unidade) {
    case 'un': return 'cada'
    case 'kg': return 'o kg'
    case 'cx': return item.qtdEmbalagem ? `cx c/${item.qtdEmbalagem}` : 'a caixa'
    case 'fardo': return item.qtdEmbalagem ? `fardo c/${item.qtdEmbalagem}` : 'o fardo'
    case 'pct': return 'o pacote'
    case 'dz': return 'a dúzia'
    case 'l': return 'o litro'
    default: return undefined
  }
}

/** Valores padrão dos campos extras de um manifest. */
export function camposPadrao(m: TemplateManifest): Record<string, string> {
  return Object.fromEntries(m.campos.map((c) => [c.id, c.padrao]))
}

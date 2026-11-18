import type { Marca } from '@/brand/types'
import type { ItemOferta } from '@/templates/types'

/** Marcas e produtos fictícios para prévias e para a página do design system. */
export const MARCA_MERCADO: Marca = {
  nome: 'Mercado Boa Praça',
  segmento: 'mercado',
  whatsapp: '11987654321',
  endereco: 'Rua das Flores, 120 · Centro',
  horario: 'Seg a Sáb 7h–21h',
  paleta: {
    primaria: '#D7141A', secundaria: '#0B3D91', destaque: '#FFD200', fundo: '#FFF8E6', texto: '#1A1A1A',
    sobrePrimaria: '#FFFFFF', sobreSecundaria: '#FFFFFF', sobreDestaque: '#1A1A1A',
  },
}

export const MARCA_DISTRIBUIDORA: Marca = {
  nome: 'Distribuidora Rio Verde',
  segmento: 'distribuidora',
  whatsapp: '62991234567',
  endereco: 'Av. Industrial, 2.400 · Galpão 3',
  horario: 'Seg a Sex 7h–18h · Sáb 7h–12h',
  paleta: {
    primaria: '#0F6B3A', secundaria: '#B35F00', destaque: '#FFE14D', fundo: '#F2F7F3', texto: '#10231A',
    sobrePrimaria: '#FFFFFF', sobreSecundaria: '#FFFFFF', sobreDestaque: '#10231A',
  },
}

export const PRODUTOS_AMOSTRA: ItemOferta[] = [
  { id: '1', nome: 'Refrigerante cola', detalhe: 'lata 350 ml', preco: 2.99, precoAntigo: 4.49, unidade: 'un', foto: '/amostras/lata.svg' },
  { id: '2', nome: 'Água mineral sem gás', detalhe: 'fardo 6 × 1,5 L', preco: 11.9, precoAntigo: 15.9, unidade: 'fardo', qtdEmbalagem: 6, foto: '/amostras/garrafa.svg' },
  { id: '3', nome: 'Leite integral', detalhe: 'caixa c/ 12 × 1 L', preco: 54.9, unidade: 'cx', qtdEmbalagem: 12, foto: '/amostras/caixa.svg' },
  { id: '4', nome: 'Picanha bovina maturada', detalhe: 'peça resfriada', preco: 69.9, precoAntigo: 89.9, unidade: 'kg', foto: '/amostras/picanha.svg' },
]

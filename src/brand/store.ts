import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CorExtraida } from './extrair'
import { finalizarPaleta, sugerirBase, type PaletaBase, type PapelBase, type PaletaFinal } from './papeis'
import type { Marca } from './types'

type DadosMarca = Omit<Marca, 'paleta'>

interface EstadoMarca {
  dados: DadosMarca
  /** cores extraídas da logo (para sugestões rápidas) */
  extraidas: Pick<CorExtraida, 'hex' | 'peso'>[]
  /** sugestão automática a partir da logo */
  sugestao: PaletaBase
  /** escolha atual (sugestão + edições manuais) */
  base: PaletaBase
  corrigirContraste: boolean

  atualizarDados: (d: Partial<DadosMarca>) => void
  definirLogo: (logoUrl: string, cores: CorExtraida[]) => void
  removerLogo: () => void
  definirCor: (papel: PapelBase, hex: string) => void
  restaurarSugestao: () => void
  trocarPrimariaSecundaria: () => void
  setCorrigirContraste: (v: boolean) => void
}

const BASE_PADRAO: PaletaBase = { primaria: '#D7141A', secundaria: '#0B3D91', destaque: '#FFD200', fundo: '#FFF8E6', texto: '#1A1A1A' }

/**
 * Marca do cliente. Nesta etapa fica salva no aparelho (localStorage);
 * na etapa do Supabase passa a sincronizar com a tabela `empresas`.
 */
export const useMarcaStore = create<EstadoMarca>()(
  persist(
    (set) => ({
      dados: { nome: '', segmento: 'mercado', whatsapp: '', endereco: '', horario: '' },
      extraidas: [],
      sugestao: BASE_PADRAO,
      base: BASE_PADRAO,
      corrigirContraste: true,

      atualizarDados: (d) => set((s) => ({ dados: { ...s.dados, ...d } })),
      definirLogo: (logoUrl, cores) => {
        const sugestao = cores.length ? sugerirBase(cores) : BASE_PADRAO
        set((s) => ({
          dados: { ...s.dados, logoUrl },
          extraidas: cores.map(({ hex, peso }) => ({ hex, peso })),
          sugestao,
          base: sugestao,
        }))
      },
      removerLogo: () => set((s) => ({ dados: { ...s.dados, logoUrl: undefined }, extraidas: [] })),
      definirCor: (papel, hex) => set((s) => ({ base: { ...s.base, [papel]: hex.toUpperCase() } })),
      restaurarSugestao: () => set((s) => ({ base: s.sugestao })),
      trocarPrimariaSecundaria: () => set((s) => ({ base: { ...s.base, primaria: s.base.secundaria, secundaria: s.base.primaria } })),
      setCorrigirContraste: (v) => set({ corrigirContraste: v }),
    }),
    { name: 'ofertapronta:marca', version: 1 },
  ),
)

/** Paleta final (com cores "sobre" e correções de contraste) derivada do estado. */
export function usePaletaFinal(): PaletaFinal {
  const base = useMarcaStore((s) => s.base)
  const corrigir = useMarcaStore((s) => s.corrigirContraste)
  return useMemo(() => finalizarPaleta(base, corrigir), [base, corrigir])
}

export function useMarcaAtual(): Marca {
  const dados = useMarcaStore((s) => s.dados)
  const { paleta } = usePaletaFinal()
  return useMemo(() => ({ ...dados, nome: dados.nome || 'Sua empresa', whatsapp: dados.whatsapp || '11900000000', endereco: dados.endereco || 'Seu endereço', horario: dados.horario || 'Seu horário', paleta }), [dados, paleta])
}

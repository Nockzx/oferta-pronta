/** Papéis de cor usados por todas as artes. Sempre hex #RRGGBB. */
export interface PapeisCor {
  primaria: string
  secundaria: string
  destaque: string
  fundo: string
  texto: string
  /** cor de texto legível sobre cada superfície (calculada por contraste WCAG) */
  sobrePrimaria: string
  sobreSecundaria: string
  sobreDestaque: string
}

export type Segmento = 'distribuidora' | 'mercado' | 'acougue' | 'hortifruti'

export interface Marca {
  nome: string
  segmento: Segmento
  whatsapp: string
  endereco: string
  horario: string
  logoUrl?: string
  paleta: PapeisCor
}

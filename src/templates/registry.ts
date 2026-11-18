import type { ComponentType } from 'react'
import type { Template, TemplateManifest, TemplateProps } from './types'

/**
 * Registro automático: cada pasta em src/templates/<id>/ com manifest.json + index.tsx
 * vira um modelo disponível. Para criar um modelo novo, copie uma pasta.
 */
const manifests = import.meta.glob<TemplateManifest>('./*/manifest.json', { eager: true, import: 'default' })
const componentes = import.meta.glob<ComponentType<TemplateProps>>('./*/index.tsx', { eager: true, import: 'default' })

export const TEMPLATES: Template[] = Object.entries(manifests)
  .map(([caminho, manifest]) => {
    const Componente = componentes[caminho.replace('manifest.json', 'index.tsx')]
    if (!Componente) throw new Error(`Modelo sem index.tsx: ${caminho}`)
    return { manifest, Componente }
  })
  .sort((a, b) => a.manifest.nome.localeCompare(b.manifest.nome, 'pt-BR'))

export function buscarTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.manifest.id === id)
}

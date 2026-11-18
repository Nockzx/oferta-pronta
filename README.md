# OfertaPronta

SaaS que gera artes de ofertas (feed, story e A4) com a identidade visual de cada cliente — distribuidoras, mercados, açougues e hortifrutis. Toda a geração de imagem acontece no navegador; infraestrutura 100% gratuita (Cloudflare Pages + Supabase).

- Proposta, arquitetura e plano de etapas: [docs/PROPOSTA.md](docs/PROPOSTA.md)
- Prévia estática do design system: [docs/design-system-preview.html](docs/design-system-preview.html)

## Rodar localmente

Requer Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173  →  /design-system
npm run build      # checa tipos e gera dist/
```

## Estrutura

```
src/
  design/      design system das artes (tokens, Artboard, Preco, Selos, FitText, FotoProduto…)
  templates/   um modelo por pasta: manifest.json + index.tsx (registro automático)
  brand/       tipos de marca e papéis de cor
  pages/       telas do app
  lib/         utilidades (formatação BRL, telefone, dados de amostra)
```

## Criar um modelo novo

1. Copie `src/templates/oferta-explosao/` para `src/templates/<novo-id>/`.
2. Edite `manifest.json` (id, nome, categoria, formatos, nº de produtos, variações, campos extras).
3. Edite `index.tsx`: o componente recebe `{ marca, itens, formato, variacao, campos }` e desenha numa prancheta de 1080 de largura usando os componentes de `@/design` e as cores `var(--p)`, `var(--s)`, `var(--a)`, `var(--bg)`, `var(--tx)`.
4. Pronto — ele aparece automaticamente na biblioteca.

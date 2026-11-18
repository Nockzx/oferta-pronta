# OfertaPronta — Proposta de arquitetura (Etapa 1, para aprovação)

> Prévia visual do design system: [`docs/design-system-preview.html`](./design-system-preview.html) (abrir no navegador).

## 1. Visão geral

```
┌──────────────── Navegador (Cloudflare Pages, estático) ────────────────┐
│ React + Vite + TS + Tailwind                                           │
│                                                                         │
│  Onboarding ──► Marca (logo → paleta → papéis de cor + WCAG)            │
│  Editor ──► Produtos/listas ──► Modelo (React + manifest JSON)          │
│                                   │                                     │
│                         Motor de render (html-to-image)                 │
│                         PNG · PDF (jsPDF) · ZIP (fflate)                │
└───────────────▲───────────────────────────────▲─────────────────────────┘
                │ supabase-js (anon key + RLS)  │ Storage (logos, fotos)
┌───────────────┴────────────── Supabase (grátis) ────────────────────────┐
│ Auth · Postgres + RLS · Storage · Edge Function `hotmart-webhook`      │
└───────────────────────────────▲─────────────────────────────────────────┘
                                │ POST (hottok)
                             Hotmart
```

Custo: **R$ 0**. Nenhum servidor nosso; toda imagem é gerada no aparelho do cliente.

## 2. Stack e bibliotecas (todas gratuitas, licença MIT/OFL/ISC)

| Necessidade | Escolha | Por quê |
|---|---|---|
| UI | React 19, Vite, TypeScript, Tailwind v4 | pedido; rápido no celular |
| Rotas / dados | react-router, @tanstack/react-query | cache e estados de carregamento simples |
| Estado do editor | zustand (+ persistência local) | não perde o trabalho se o celular fechar a aba |
| Validação | zod | formulários e manifests de modelo tipados |
| Render | **html-to-image** | modelos são HTML/CSS → criar modelo novo é escrever JSX, não desenhar em canvas. Konva fica descartado (layout de texto manual, pior para tipografia de tabloide) |
| PDF / ZIP | jsPDF, fflate | A4 em 300 dpi; ZIP rápido e leve |
| Cores | culori + k-means próprio em OKLab | controle total para ignorar branco/preto/transparência e ajustar luminosidade em OKLCH |
| Fontes | @fontsource (Anton, Barlow Condensed, Barlow) | fontes do Google empacotadas no bundle → render sem CORS e funciona offline |
| Ícones | lucide-react | livre |
| QR do WhatsApp | qrcode | para artes impressas (A4) |
| PWA | vite-plugin-pwa | “instalar” no celular, ícone na tela inicial |

## 3. Estrutura de pastas

```
oferta-pronta/
├─ src/
│  ├─ app/                 # rotas, layout, providers, guarda de assinatura
│  ├─ pages/               # Login, Cadastro, Onboarding, Modelos, Editor, Listas, Marca, Conta, Bloqueado
│  ├─ components/ui/       # botões, inputs, sheets (UI do app, não das artes)
│  ├─ design/              # DESIGN SYSTEM DAS ARTES
│  │  ├─ tokens.ts         # escala tipográfica, espaçamento, raios, sombras, formatos
│  │  ├─ Artboard.tsx      # prancheta 1080×H com escala para prévia
│  │  ├─ Preco.tsx         # preço (livre | bloco | etiqueta | explosao | fita)
│  │  ├─ PrecoAntigo.tsx
│  │  ├─ Selo.tsx          # tarja | pilula | carimbo | canto
│  │  ├─ Fundo.tsx         # raios | meio-tom | diagonal | liso
│  │  ├─ BarraMarca.tsx, Rodape.tsx, BotaoWhats.tsx, FotoProduto.tsx, FitText.tsx
│  │  └─ shapes.ts         # explosão (starburst), etc.
│  ├─ templates/           # MODELOS — uma pasta por modelo
│  │  ├─ registry.ts       # carrega todos via import.meta.glob
│  │  ├─ types.ts          # TemplateManifest, TemplateProps
│  │  └─ oferta-explosao/
│  │     ├─ manifest.json  # id, nome, categoria, formatos, nº de produtos, variações, campos extras
│  │     └─ index.tsx      # componente React que recebe {marca, produtos, formato, variacao, opcoes}
│  ├─ brand/               # extração de paleta, papéis de cor, contraste WCAG
│  ├─ render/              # exportar PNG/PDF/ZIP, fila de lote, pré-carregar fontes/imagens
│  ├─ editor/              # store zustand, formulário de produtos, prévia ao vivo
│  ├─ lib/                 # supabase client, formatação BRL, telefone, datas
│  └─ styles/
├─ supabase/
│  ├─ migrations/          # SQL: tabelas, RLS, funções, buckets
│  └─ functions/hotmart-webhook/index.ts
├─ docs/
├─ public/
└─ README.md
```

### Como um modelo é definido

```jsonc
// src/templates/oferta-explosao/manifest.json
{
  "id": "oferta-explosao",
  "nome": "Explosão",
  "categoria": "oferta-do-dia",          // oferta-do-dia | semana | tabela-distribuidora | retencao
  "segmentos": ["mercado", "distribuidora", "acougue", "hortifruti"],
  "formatos": ["feed", "story", "a4"],
  "produtos": { "min": 1, "max": 1 },
  "variacoes": [
    { "id": "a", "nome": "Preço à direita" },
    { "id": "b", "nome": "Preço central, produto ao fundo" },
    { "id": "c", "nome": "Diagonal dividida" }
  ],
  "campos": [
    { "id": "chamada", "tipo": "texto", "rotulo": "Chamada", "padrao": "Oferta do dia" },
    { "id": "selo", "tipo": "opcao", "rotulo": "Selo", "opcoes": ["SÓ HOJE", "OFERTA RELÂMPAGO", "NENHUM"] }
  ]
}
```

```tsx
// src/templates/oferta-explosao/index.tsx
export default function OfertaExplosao({ marca, produtos, formato, variacao, campos }: TemplateProps) { ... }
```

Criar modelo novo = copiar uma pasta, editar o JSON e o JSX. O registro é automático.

## 4. Banco de dados (Supabase)

| Tabela | Campos principais |
|---|---|
| `assinaturas` | `email` (único, minúsculo), `user_id` (nulo até cadastrar), `status` (`ativa` \| `atrasada` \| `cancelada` \| `reembolsada` \| `chargeback`), `hotmart_transacao`, `hotmart_assinante`, `valida_ate`, `atualizado_em` |
| `hotmart_eventos` | `id` do evento (idempotência), `evento`, `email`, `payload jsonb`, `recebido_em` |
| `empresas` | `owner_id`, `nome`, `segmento`, `whatsapp`, `endereco`, `horario`, `logo_path`, `paleta jsonb`, `paleta_manual bool` |
| `produtos` | catálogo do cliente: `nome`, `detalhe` (ex. “lata 350 ml”), `unidade` (`un` \| `kg` \| `cx` \| `fardo` \| `pct`), `qtd_embalagem`, `foto_path`, `ultimo_preco` |
| `listas` | `nome` (“Ofertas da semana”), `itens jsonb` (produto + preço + preço antigo + selo), `atualizado_em` |

**Assinatura liga por e-mail**: o cliente pode comprar na Hotmart antes de criar a conta; ao cadastrar com o mesmo e-mail, já entra liberado.

**RLS**: função `tem_assinatura_ativa()` (`security definer`, compara `auth.jwt()->>'email'`). Políticas de `empresas`, `produtos`, `listas` e do bucket `marcas` exigem `owner_id = auth.uid()` **e** assinatura ativa. `assinaturas` é somente-leitura para o próprio usuário; só a Edge Function (service role) escreve. Estado `atrasada` mantém acesso por 3 dias de carência (configurável).

## 5. Webhook Hotmart

Edge Function `hotmart-webhook` (Deno):
1. Compara o header `X-HOTMART-HOTTOK` (webhook v2; aceita também `hottok` no corpo, v1) com o segredo `HOTMART_HOTTOK` em tempo constante → 401 se diferente.
2. Grava o evento em `hotmart_eventos` (ignora duplicado).
3. Mapeia: `PURCHASE_APPROVED`/`PURCHASE_COMPLETE` → `ativa`; `PURCHASE_DELAYED` → `atrasada`; `PURCHASE_CANCELED`/`SUBSCRIPTION_CANCELLATION`/`PURCHASE_EXPIRED` → `cancelada`; `PURCHASE_REFUNDED` → `reembolsada`; `PURCHASE_CHARGEBACK`/`PURCHASE_PROTEST` → `chargeback`.
4. `upsert` em `assinaturas` por `data.buyer.email`.

## 6. Paleta a partir da logo

1. Carrega PNG/JPG/SVG (SVG rasterizado) em canvas de ~120 px.
2. Descarta alfa < 200, L < 0,12 (quase preto), L > 0,95 com croma baixo (quase branco).
3. k-means (k = 5, inicialização k-means++) em OKLab, peso por área.
4. Papéis: **primária** = cluster de maior área com croma ≥ 0,08; **secundária** = mais distante em matiz; **destaque** = o mais claro/saturado ou, se não houver, amarelo varejo `#FFD200`/complementar; **fundo** = primária com L 0,97 e croma 0,02; **texto** = primária com L 0,18.
5. Contraste WCAG: para cada par (texto sobre primária/secundária/destaque/fundo) escolhe branco ou escuro; se nenhum atingir 4,5:1 (3:1 para preço grande), ajusta L em OKLCH passo a passo até passar, preservando matiz.
6. Tela mostra original × ajustada, e permite editar cada papel manualmente (com o mesmo verificador).

## 7. Os 12 modelos iniciais (cada um em feed, story e A4; 2–3 variações de layout)

| # | Categoria | Modelo | Ideia |
|---|---|---|---|
| 1 | Oferta do dia | **Explosão** | produto + preço em explosão, fundo de raios, “SÓ HOJE” |
| 2 | Oferta do dia | **Relâmpago** | composição diagonal dividida, tarja de alerta, horário limite |
| 3 | Oferta do dia | **Vitrine** | foto grande e limpa, etiqueta pendurada — açougue/hortifruti premium |
| 4 | Semana | **Tabloide Clássico** | cabeçalho + grade de 4/6/9 cards com preço em bloco |
| 5 | Semana | **Encarte Destaque** | 1–2 heróis grandes + grade menor |
| 6 | Semana | **Feira/Balcão** | lista com preço por kg, faixas por categoria (carnes, FLV) |
| 7 | Distribuidora | **Tabela Atacado** | tabela semanal: produto, embalagem, preço cx, preço un, mínimo |
| 8 | Distribuidora | **Grade Atacado 6/9/12** | cards com preço da caixa + “un. sai a”, selos “LEVE 12 PAGUE 10” |
| 9 | Distribuidora | **Pedido Rápido** | lista densa por categoria, condições de pagamento, QR do WhatsApp |
| 10 | Retenção | **Data Comemorativa** | Dia das Mães, Natal, Páscoa… com chamada e marca |
| 11 | Retenção | **Horário & Endereço** | horário, mapa estilizado, WhatsApp |
| 12 | Retenção | **Chegou Mercadoria / Dica** | variações: chegou mercadoria, reposição, dica do dia |

## 8. Plano de etapas (cada uma termina rodando localmente, com print para você aprovar)

1. **Proposta + design system** ← *estamos aqui*
2. **Base do app**: Vite/TS/Tailwind, fontes, tokens, componentes de arte (`Preco`, `Selo`, `Fundo`…), página `/design-system` viva.
3. **Marca**: upload de logo, extração de paleta, papéis + WCAG, ajuste manual.
4. **Motor de render**: Artboard, exportação PNG/PDF/ZIP + os 3 modelos de “Oferta do dia”.
5. **Supabase**: migrations, RLS, Auth, onboarding, storage, guarda de assinatura.
6. **Editor mobile-first**: produtos, catálogo, listas salvas, prévia ao vivo, geração em lote.
7. **Demais 9 modelos**.
8. **Hotmart**: Edge Function + testes com payloads de exemplo.
9. **Publicação**: README com passo a passo (Cloudflare Pages, Supabase, Hotmart).

## 9. Limites do plano grátis (para você saber)

- Supabase free **pausa o projeto após 7 dias sem uso** (reativa no painel); 500 MB de banco, 1 GB de storage, 500 mil invocações de Edge Function/mês. Fotos são comprimidas no navegador (WebP, máx. 1200 px) antes do upload.
- Cloudflare Pages: banda ilimitada, 500 builds/mês.
- Remoção de fundo de foto ficou **fora** do MVP (as libs gratuitas que rodam no navegador são AGPL ou pesadas demais para celular); os modelos já tratam foto com fundo usando moldura/recorte.

## 10. Decisões que preciso que você confirme

1. **html-to-image** (modelos em JSX/CSS) em vez de Konva. ✔︎ recomendado
2. Fontes **Anton + Barlow Condensed + Barlow** (posso trocar a de preço por Bebas Neue/Oswald se preferir outro “sotaque”).
3. Assinatura **vinculada por e-mail**, com 3 dias de carência em pagamento atrasado.
4. A4 exportado em **300 dpi** (2480×3508) — arquivos de ~3–6 MB cada.
5. Nome provisório “OfertaPronta” em toda a UI até você definir o nome final.

## 11. Imagens de produto (estratégia aprovada na conversa)

Objetivo: quase todo produto cadastrado ter foto bonita, recortada e alinhada — sem custo e sem depender do Claude em produção.

**Busca em cascata** (no navegador do cliente, ao digitar o nome ou ler o código de barras):

1. **Banco compartilhado do OfertaPronta** (tabela `imagens_produto` + bucket público): toda imagem aprovada por um cliente fica disponível para todos, indexada por **EAN** e por nome normalizado (busca `pg_trgm`). Efeito de rede: quanto mais clientes, menos buscas externas.
2. **Open Food Facts** (API pública, gratuita, forte cobertura de produtos brasileiros): busca por EAN (leitura pela câmera do celular com `BarcodeDetector`/ZXing) ou por nome. Imagens CC-BY-SA → crédito discreto “Foto: Open Food Facts” na área de aviso legal.
3. **Biblioteca genérica curada** (hortifruti, carnes, padaria, granel — itens sem código de barras): ~300 recortes PNG/WebP de bancos com licença livre para uso comercial, já sem fundo, versionados no repositório (`public/biblioteca/`, ~20 MB) e mapeados por sinônimos (“contra filé”, “contrafilé”, “contra-filé”).
4. **Foto do próprio cliente** (câmera do celular), com o mesmo tratamento automático.
5. Sem nada encontrado: marcador elegante na cor da marca (a arte nunca quebra).

Quando a imagem externa não permitir CORS, uma **Cloudflare Pages Function** (grátis, 100 mil req/dia) serve como proxy; a primeira cópia é salva no banco compartilhado, então cada imagem externa é baixada uma vez só.

**Tratamento automático (navegador, sem IA paga):**

- Remoção de fundo claro por *flood fill* a partir das bordas com tolerância em OKLab + suavização da borda (resolve a maioria das fotos de embalagem, que vêm em fundo branco).
- **Recorte justo** pelo contorno (sem margem), centralização e redução para WebP 1000 px.
- **Normalização de peso visual**: cada imagem guarda proporção e área ocupada; o slot de foto escala garrafas altas e bandejas largas para parecerem do mesmo tamanho, todas apoiadas na mesma linha de chão com sombra de contato.
- Ajuste manual opcional: arrastar/zoom e “borracha” simples.

**Títulos perfeitos:** normalização do nome (“COCA COLA LT 350ML” → nome “Coca-Cola” + detalhe “lata 350 ml”), dicionário de abreviações do varejo (LT, PCT, CX, FD, UN, KG, GR), e `FitText` que encolhe o texto para caber no número de linhas do modelo — nunca corta nem sobrepõe.

**Precisa do Claude in Chrome?** Não. Tudo roda no app via APIs públicas. Para montar a biblioteca genérica inicial, uso scripts de desenvolvimento (download + recorte em lote), executados uma vez.

Nova ordem das etapas: 3 Marca · 4 Motor de render + modelos de oferta do dia · 5 Supabase · 6 Editor · **7 Imagens de produto** · 8 Demais modelos · 9 Hotmart · 10 Publicação.

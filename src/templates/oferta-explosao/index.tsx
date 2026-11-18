import type { CSSProperties } from 'react'
import { BotaoWhats, FaixaCanto, FitText, FotoProduto, FundoRaios, Logo, MeioTom, Preco, PrecoAntigo, Tarja } from '@/design'
import type { Formato } from '@/design/tokens'
import { rotuloUnidade, type TemplateProps } from '../types'

/* ------------------------------------------------------------------
 * Grade de posições por formato. Tudo em unidades de arte (base 1080).
 * Manter as posições numa tabela deixa fácil ajustar sem caçar números no JSX.
 * ------------------------------------------------------------------ */
type Caixa = { x: number; y: number; w: number; h: number }

interface LayoutA {
  marca: { x: number; y: number }
  tarja: { x: number; y: number; t: number }
  foto: Caixa
  nome: { x: number; y: number; w: number; max: number; linhas: number; detalhe: number }
  explosao: { x: number; y: number; d: number; preco: number }
  rodape: { h: number }
}

const A: Record<Formato, LayoutA> = {
  feed: {
    marca: { x: 64, y: 64 },
    tarja: { x: 64, y: 252, t: 92 },
    foto: { x: 80, y: 372, w: 440, h: 380 },
    nome: { x: 80, y: 772, w: 450, max: 50, linhas: 2, detalhe: 32 },
    explosao: { x: 520, y: 360, d: 540, preco: 200 },
    rodape: { h: 130 },
  },
  story: {
    marca: { x: 64, y: 240 },
    tarja: { x: 52, y: 420, t: 112 },
    foto: { x: 150, y: 580, w: 560, h: 520 },
    nome: { x: 64, y: 1150, w: 420, max: 64, linhas: 3, detalhe: 38 },
    explosao: { x: 480, y: 860, d: 560, preco: 200 },
    rodape: { h: 300 },
  },
  a4: {
    marca: { x: 72, y: 72 },
    tarja: { x: 64, y: 262, t: 100 },
    foto: { x: 72, y: 420, w: 500, h: 540 },
    nome: { x: 72, y: 1000, w: 936, max: 84, linhas: 2, detalhe: 42 },
    explosao: { x: 500, y: 410, d: 580, preco: 220 },
    rodape: { h: 210 },
  },
}

export default function OfertaExplosao(props: TemplateProps) {
  return props.variacao === 'b' ? <Diagonal {...props} /> : <Raios {...props} />
}

/* =========================== Variação A — Raios =========================== */
function Raios({ marca, itens, formato, campos }: TemplateProps) {
  const L = A[formato]
  const item = itens[0]
  const H = { feed: 1080, story: 1920, a4: 1527 }[formato]
  const abs = (x: number, y: number): CSSProperties => ({ position: 'absolute', left: x, top: y })
  const cyRaios = ((L.explosao.y + L.explosao.d / 2) / H) * 100

  return (
    <>
      <FundoRaios cx={60} cy={cyRaios} />
      <MeioTom />
      {campos.selo && campos.selo !== 'Nenhum' && (
        <FaixaCanto style={formato === 'story' ? { top: 250 } : undefined}>{campos.selo}</FaixaCanto>
      )}

      <CabecalhoMarca marca={marca} x={L.marca.x} y={L.marca.y} sub={campos.validade || undefined} />

      <div style={abs(L.tarja.x, L.tarja.y)}><Tarja tamanho={L.tarja.t}>{campos.chamada}</Tarja></div>

      <FotoProduto src={item.foto} alt={item.nome} largura={L.foto.w} altura={L.foto.h} style={abs(L.foto.x, L.foto.y)} />

      <div style={{ ...abs(L.nome.x, L.nome.y), width: L.nome.w, color: 'var(--onp)', textShadow: '0 4px 0 rgba(0,0,0,.25)' }}>
        <FitText max={L.nome.max} linhas={L.nome.linhas} lineHeight={0.98} style={{ fontFamily: 'var(--f-display)', fontWeight: 800, textTransform: 'uppercase' }}>
          {item.nome}
        </FitText>
        {item.detalhe && (
          <div style={{ font: `600 ${L.nome.detalhe}px/1.1 var(--f-display)`, textTransform: 'uppercase', opacity: 0.92, marginTop: 6 }}>{item.detalhe}</div>
        )}
      </div>

      <div style={{ ...abs(L.explosao.x, L.explosao.y), width: L.explosao.d, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {item.precoAntigo && (
          <div style={{ position: 'relative', zIndex: 2, marginBottom: -L.explosao.d * 0.03, textShadow: '0 3px 0 rgba(0,0,0,.25)' }}>
            <PrecoAntigo valor={item.precoAntigo} tamanho={L.explosao.preco * 0.2} cor="var(--onp)" />
          </div>
        )}
        <Preco estilo="explosao" valor={item.preco} tamanho={L.explosao.preco} diametro={L.explosao.d} pontas={22} unidade={rotuloUnidade(item)} />
      </div>

      <Rodape marca={marca} formato={formato} altura={L.rodape.h} />
    </>
  )
}

/* ========================= Variação B — Diagonal ========================= */
interface LayoutB {
  corte: string
  faixa: string
  marca: { x: number; y: number }
  tarja: { x: number; y: number; t: number }
  nome: { x: number; y: number; w: number; max: number; linhas: number; detalhe: number }
  /** preço ancorado pela base: distância da borda inferior da prancheta */
  preco: { x: number; base: number; t: number; antigoCor: string }
  foto: Caixa
  rodape: { h: number }
}

const B: Record<Formato, LayoutB> = {
  feed: {
    corte: 'polygon(0 0, 60% 0, 40% 100%, 0 100%)',
    faixa: 'polygon(60% 0, 63% 0, 43% 100%, 40% 100%)',
    marca: { x: 64, y: 64 },
    tarja: { x: 56, y: 240, t: 64 },
    nome: { x: 64, y: 370, w: 400, max: 60, linhas: 2, detalhe: 30 },
    preco: { x: 56, base: 175, t: 160, antigoCor: 'var(--onp)' },
    foto: { x: 470, y: 150, w: 560, h: 700 },
    rodape: { h: 120 },
  },
  story: {
    corte: 'polygon(0 0, 100% 0, 100% 40%, 0 52%)',
    faixa: 'polygon(0 52%, 100% 40%, 100% 41.6%, 0 53.6%)',
    marca: { x: 64, y: 240 },
    tarja: { x: 56, y: 410, t: 96 },
    nome: { x: 64, y: 560, w: 940, max: 92, linhas: 2, detalhe: 44 },
    preco: { x: 56, base: 470, t: 200, antigoCor: 'var(--tx)' },
    foto: { x: 440, y: 860, w: 600, h: 720 },
    rodape: { h: 300 },
  },
  a4: {
    corte: 'polygon(0 0, 62% 0, 42% 100%, 0 100%)',
    faixa: 'polygon(62% 0, 65% 0, 45% 100%, 42% 100%)',
    marca: { x: 72, y: 72 },
    tarja: { x: 64, y: 250, t: 76 },
    nome: { x: 72, y: 390, w: 440, max: 76, linhas: 3, detalhe: 36 },
    preco: { x: 64, base: 280, t: 190, antigoCor: 'var(--onp)' },
    foto: { x: 480, y: 240, w: 560, h: 920 },
    rodape: { h: 210 },
  },
}

function Diagonal({ marca, itens, formato, campos }: TemplateProps) {
  const L = B[formato]
  const item = itens[0]
  const abs = (x: number, y: number): CSSProperties => ({ position: 'absolute', left: x, top: y })

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)' }} />
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><MeioTom angulo={formato === 'story' ? 200 : 20} /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--p)', clipPath: L.corte }} />
      <div style={{ position: 'absolute', inset: 0, background: 'var(--a)', clipPath: L.faixa }} />
      {campos.selo && campos.selo !== 'Nenhum' && (
        <FaixaCanto style={formato === 'story' ? { top: 250 } : undefined}>{campos.selo}</FaixaCanto>
      )}

      <FotoProduto src={item.foto} alt={item.nome} largura={L.foto.w} altura={L.foto.h} style={abs(L.foto.x, L.foto.y)} />

      <CabecalhoMarca marca={marca} x={L.marca.x} y={L.marca.y} sub={campos.validade || undefined} />
      <div style={abs(L.tarja.x, L.tarja.y)}><Tarja tamanho={L.tarja.t} alerta>{campos.chamada}</Tarja></div>

      <div style={{ ...abs(L.nome.x, L.nome.y), width: L.nome.w, color: 'var(--onp)' }}>
        <FitText max={L.nome.max} linhas={L.nome.linhas} lineHeight={0.95} style={{ fontFamily: 'var(--f-display)', fontWeight: 900, textTransform: 'uppercase' }}>
          {item.nome}
        </FitText>
        {item.detalhe && (
          <div style={{ font: `600 ${L.nome.detalhe}px/1.1 var(--f-display)`, textTransform: 'uppercase', opacity: 0.9, marginTop: 8 }}>{item.detalhe}</div>
        )}
      </div>

      <div style={{ position: 'absolute', left: L.preco.x, bottom: L.preco.base, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: L.preco.t * 0.08 }}>
        {item.precoAntigo && <PrecoAntigo valor={item.precoAntigo} tamanho={L.preco.t * 0.19} cor={L.preco.antigoCor} sufixo="por" />}
        <Preco estilo="bloco" valor={item.preco} tamanho={L.preco.t} unidade={rotuloUnidade(item)} style={{ transform: 'rotate(-3deg)' }} />
      </div>

      <Rodape marca={marca} formato={formato} altura={L.rodape.h} sobreClaro={formato === 'story'} />
    </>
  )
}

/* ============================ Peças comuns ============================ */
function CabecalhoMarca({ marca, x, y, sub }: { marca: TemplateProps['marca']; x: number; y: number; sub?: string }) {
  return (
    <div className="op-marca" style={{ position: 'absolute', left: x, top: y, color: 'var(--onp)', maxWidth: 640 }}>
      <Logo marca={marca} />
      <div style={{ font: '800 40px/0.95 var(--f-display)', textTransform: 'uppercase' }}>
        <FitText max={40} min={26} linhas={2} lineHeight={0.95} style={{ maxWidth: 440 }}>{marca.nome}</FitText>
        {sub && <div style={{ font: '600 22px/1.2 var(--f-corpo)', textTransform: 'none', opacity: 0.85, marginTop: 6 }}>{sub}</div>}
      </div>
    </div>
  )
}

function Rodape({ marca, formato, altura, sobreClaro }: { marca: TemplateProps['marca']; formato: Formato; altura: number; sobreClaro?: boolean }) {
  if (formato === 'story') {
    // No story, a base fica sob a interface do Instagram: contato vai acima dela, faixa decorativa embaixo.
    return (
      <>
        <div style={{ position: 'absolute', left: 64, right: 64, top: 1920 - altura - 104, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <div style={{ font: '600 28px/1.25 var(--f-corpo)', color: sobreClaro ? 'var(--tx)' : 'var(--onp)', textShadow: sobreClaro ? 'none' : '0 2px 0 rgba(0,0,0,.25)', maxWidth: 520 }}>
            {marca.endereco}
            <br />
            <span style={{ opacity: 0.85, fontSize: 22 }}>{marca.horario}</span>
          </div>
          <BotaoWhats numero={marca.whatsapp} tamanho={38} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: altura, background: 'var(--s)', color: 'var(--ons)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 40, font: '500 20px/1 var(--f-corpo)', opacity: 1 }}>
          <span style={{ opacity: 0.7 }}>Imagens ilustrativas · ofertas válidas enquanto durarem os estoques</span>
        </div>
      </>
    )
  }
  const a4 = formato === 'a4'
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: altura, background: 'var(--s)', color: 'var(--ons)',
        padding: `0 ${a4 ? 72 : 64}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
      }}
    >
      <div style={{ font: `600 ${a4 ? 30 : 24}px/1.3 var(--f-corpo)`, minWidth: 0 }}>
        {marca.endereco}
        <br />
        <span style={{ opacity: 0.8, fontSize: a4 ? 24 : 19 }}>{marca.horario} · Imagens ilustrativas</span>
      </div>
      <BotaoWhats numero={marca.whatsapp} tamanho={a4 ? 40 : 32} />
    </div>
  )
}

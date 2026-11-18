import { useRef, useState, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { ArrowDownUp, Check, ImageUp, Info, Loader2, RotateCcw, TriangleAlert, Wand2, X } from 'lucide-react'
import { ArtboardPreview, type Formato } from '@/design'
import { extrairCores, prepararLogo } from '@/brand/extrair'
import { NOMES_PAPEIS, type PapelBase } from '@/brand/papeis'
import { useMarcaAtual, useMarcaStore, usePaletaFinal } from '@/brand/store'
import { hexValido } from '@/brand/cor'
import type { Segmento } from '@/brand/types'
import { telefone } from '@/lib/formatar'
import { PRODUTOS_AMOSTRA } from '@/lib/amostras'
import { buscarTemplate } from '@/templates/registry'
import { camposPadrao } from '@/templates/types'

const SEGMENTOS: { id: Segmento; nome: string }[] = [
  { id: 'distribuidora', nome: 'Distribuidora' },
  { id: 'mercado', nome: 'Mercado' },
  { id: 'acougue', nome: 'Açougue' },
  { id: 'hortifruti', nome: 'Hortifruti' },
]

export function MarcaPage() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="space-y-6">
        <header>
          <p className="rotulo">Etapa 3</p>
          <h1 className="mt-1 font-display text-4xl font-black uppercase leading-none sm:text-5xl">Minha marca</h1>
          <p className="mt-2 text-zinc-600">Envie a logo: as cores saem dela automaticamente e todas as artes passam a usar a sua identidade.</p>
        </header>
        <Cartao titulo="1. Logo"><EnvioLogo /></Cartao>
        <Cartao titulo="2. Cores da marca"><EditorCores /></Cartao>
        {/* no celular a prévia fica logo abaixo das cores, para ver o efeito na hora */}
        <div className="lg:hidden"><Previa /></div>
        <Cartao titulo="3. Dados da empresa"><DadosEmpresa /></Cartao>
      </div>
      <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
        <Previa />
      </aside>
    </div>
  )
}

/* ================================ Logo ================================ */
function EnvioLogo() {
  const logo = useMarcaStore((s) => s.dados.logoUrl)
  const extraidas = useMarcaStore((s) => s.extraidas)
  const definirLogo = useMarcaStore((s) => s.definirLogo)
  const removerLogo = useMarcaStore((s) => s.removerLogo)
  const input = useRef<HTMLInputElement>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string>()

  async function aoEscolher(arquivo?: File) {
    if (!arquivo) return
    setErro(undefined)
    if (!/image\/(png|jpe?g|svg\+xml|webp)/.test(arquivo.type) && !/\.(png|jpe?g|svg|webp)$/i.test(arquivo.name)) {
      setErro('Formato não suportado. Envie PNG, JPG, SVG ou WebP.')
      return
    }
    setCarregando(true)
    try {
      const url = await prepararLogo(arquivo)
      const cores = await extrairCores(url)
      if (!cores.length) setErro('Não encontramos cores na logo (ela parece só preto e branco). Usamos uma paleta padrão; ajuste abaixo se quiser.')
      definirLogo(url, cores)
    } catch {
      setErro('Não conseguimos ler esse arquivo. Tente outra imagem.')
    } finally {
      setCarregando(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); aoEscolher(e.dataTransfer.files[0]) }}
      >
        <div className="grid h-36 w-full shrink-0 place-items-center overflow-hidden rounded-2xl border border-zinc-200 sm:w-36"
          style={{ backgroundImage: 'repeating-conic-gradient(#f4f4f5 0 25%, #fff 0 50%)', backgroundSize: '18px 18px' }}>
          {logo ? <img src={logo} alt="Logo" className="max-h-28 max-w-[85%] object-contain" /> : <ImageUp className="text-zinc-400" size={36} />}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <button
            onClick={() => input.current?.click()}
            disabled={carregando}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-tinta px-5 font-semibold text-white disabled:opacity-60"
          >
            {carregando ? <Loader2 className="animate-spin" size={18} /> : <ImageUp size={18} />}
            {carregando ? 'Lendo as cores…' : logo ? 'Trocar logo' : 'Enviar logo'}
          </button>
          {logo && (
            <button onClick={removerLogo} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-zinc-600 hover:bg-zinc-100">
              <X size={16} /> Remover logo
            </button>
          )}
          <p className="text-sm text-zinc-500">PNG com fundo transparente ou SVG dão o melhor resultado. JPG também funciona: o fundo branco é ignorado.</p>
        </div>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp,.svg" className="hidden" onChange={(e) => aoEscolher(e.target.files?.[0])} />
      </div>
      {erro && <Aviso>{erro}</Aviso>}
      {extraidas.length > 0 && (
        <div>
          <div className="rotulo mb-2">Cores encontradas na logo</div>
          <div className="flex flex-wrap gap-2">
            {extraidas.map((c) => (
              <div key={c.hex} className="flex items-center gap-2 rounded-full bg-zinc-100 py-1 pl-1 pr-3 text-sm">
                <span className="h-6 w-6 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} />
                <span className="font-mono text-xs">{c.hex}</span>
                <span className="text-zinc-500">{Math.round(c.peso * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================ Cores ================================ */
function EditorCores() {
  const base = useMarcaStore((s) => s.base)
  const sugestao = useMarcaStore((s) => s.sugestao)
  const extraidas = useMarcaStore((s) => s.extraidas)
  const corrigir = useMarcaStore((s) => s.corrigirContraste)
  const definirCor = useMarcaStore((s) => s.definirCor)
  const restaurar = useMarcaStore((s) => s.restaurarSugestao)
  const trocar = useMarcaStore((s) => s.trocarPrimariaSecundaria)
  const setCorrigir = useMarcaStore((s) => s.setCorrigirContraste)
  const { paleta, ajustes, checagens } = usePaletaFinal()
  const editado = (Object.keys(base) as PapelBase[]).some((k) => base[k] !== sugestao[k])

  const sobre: Partial<Record<PapelBase, string>> = {
    primaria: paleta.sobrePrimaria, secundaria: paleta.sobreSecundaria, destaque: paleta.sobreDestaque, fundo: paleta.texto, texto: paleta.fundo,
  }

  return (
    <div className="space-y-5">
      <div className="divide-y divide-zinc-100">
        {(Object.keys(NOMES_PAPEIS) as PapelBase[]).map((papel) => {
          const ajuste = ajustes.find((a) => a.papel === papel)
          return (
            <LinhaCor
              key={papel}
              papel={papel}
              valor={base[papel]}
              final={paleta[papel]}
              textoSobre={sobre[papel]!}
              sugestoes={extraidas.map((e) => e.hex)}
              ajuste={ajuste ? `Ajustada de ${ajuste.de} para ${ajuste.para}: ${ajuste.motivo}.` : undefined}
              onChange={(hex) => definirCor(papel, hex)}
            />
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={corrigir} onChange={(e) => setCorrigir(e.target.checked)} className="h-5 w-5 accent-black" />
          Corrigir contraste automaticamente
        </label>
        <div className="flex flex-wrap gap-1">
        <button onClick={trocar} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100">
          <ArrowDownUp size={16} /> Inverter primária e secundária
        </button>
        <button
          onClick={restaurar}
          disabled={!editado}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
        >
          <RotateCcw size={16} /> Voltar à sugestão da logo
        </button>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-50 p-4">
        <div className="rotulo mb-2">Legibilidade (WCAG AA)</div>
        <ul className="space-y-1.5 text-sm">
          {checagens.map((c, i) => (
            <li key={c.rotulo} className="flex items-center gap-2">
              <span className="grid h-7 w-11 shrink-0 place-items-center rounded-md text-xs font-bold" style={{ background: c.fundo, color: c.frente }}>Aa</span>
              <span className="flex-1">{c.rotulo}</span>
              <span className="tabular-nums text-zinc-500">{c.razao.toFixed(1)}:1</span>
              {c.ok ? <Check size={16} className="text-green-600" /> : i === 4 && corrigir ? <Info size={16} className="text-zinc-400" /> : <TriangleAlert size={16} className="text-amber-600" />}
            </li>
          ))}
        </ul>
        {!checagens[4].ok && corrigir && (
          <p className="mt-2 text-sm text-zinc-500">A primária é clara demais para títulos sobre fundo claro; nesses pontos as artes usam a cor de texto automaticamente.</p>
        )}
        {!corrigir && checagens.slice(0, 4).some((c) => !c.ok) && (
          <p className="mt-2 text-sm text-amber-700">Algum texto pode ficar difícil de ler. Ative a correção automática para resolver.</p>
        )}
      </div>
    </div>
  )
}

function LinhaCor(props: { papel: PapelBase; valor: string; final: string; textoSobre: string; sugestoes: string[]; ajuste?: string; onChange: (hex: string) => void }) {
  const { papel, valor, final, textoSobre, sugestoes, ajuste, onChange } = props
  const [texto, setTexto] = useState(valor)
  const [ultimo, setUltimo] = useState(valor)
  if (valor !== ultimo) { setUltimo(valor); setTexto(valor) }

  return (
    <div className="py-3">
      <div className="flex items-center gap-3">
        <label className="relative grid h-14 w-14 shrink-0 cursor-pointer place-items-center rounded-xl font-display text-xl font-black ring-1 ring-black/10" style={{ background: final, color: textoSobre }}>
          Aa
          <input type="color" value={valor} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`Escolher cor ${NOMES_PAPEIS[papel].nome}`} />
        </label>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{NOMES_PAPEIS[papel].nome}</div>
          <div className="truncate text-sm text-zinc-500">{NOMES_PAPEIS[papel].uso}</div>
        </div>
        <input
          value={texto}
          onChange={(e) => {
            const v = e.target.value
            setTexto(v)
            if (hexValido(v)) onChange(v.startsWith('#') ? v : '#' + v)
          }}
          className="w-24 rounded-lg border border-zinc-200 px-2 py-2 font-mono text-sm uppercase"
          aria-label={`Código da cor ${NOMES_PAPEIS[papel].nome}`}
          maxLength={7}
        />
      </div>
      {sugestoes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 pl-[68px]">
          {sugestoes.map((h) => (
            <button key={h} onClick={() => onChange(h)} title={`Usar ${h}`}
              className={clsx('h-7 w-7 rounded-full ring-1 ring-black/10 transition', h === valor && 'ring-2 ring-tinta ring-offset-2')}
              style={{ background: h }} />
          ))}
        </div>
      )}
      {ajuste && (
        <p className="mt-2 flex items-start gap-1.5 pl-[68px] text-sm text-amber-700">
          <Wand2 size={15} className="mt-0.5 shrink-0" /> {ajuste}
        </p>
      )}
    </div>
  )
}

/* ================================ Dados ================================ */
function DadosEmpresa() {
  const dados = useMarcaStore((s) => s.dados)
  const atualizar = useMarcaStore((s) => s.atualizarDados)
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Campo rotulo="Nome da empresa" className="sm:col-span-2">
        <input value={dados.nome} onChange={(e) => atualizar({ nome: e.target.value })} placeholder="Ex.: Distribuidora Rio Verde" className="campo" />
      </Campo>
      <Campo rotulo="Segmento" className="sm:col-span-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SEGMENTOS.map((s) => (
            <button key={s.id} onClick={() => atualizar({ segmento: s.id })}
              className={clsx('min-h-12 rounded-xl border px-3 font-semibold', dados.segmento === s.id ? 'border-tinta bg-tinta text-white' : 'border-zinc-200 bg-white hover:bg-zinc-50')}>
              {s.nome}
            </button>
          ))}
        </div>
      </Campo>
      <Campo rotulo="WhatsApp">
        <input value={dados.whatsapp} inputMode="tel" onChange={(e) => atualizar({ whatsapp: e.target.value })} onBlur={(e) => atualizar({ whatsapp: telefone(e.target.value) })} placeholder="(62) 99123-4567" className="campo" />
      </Campo>
      <Campo rotulo="Horário de funcionamento">
        <input value={dados.horario} onChange={(e) => atualizar({ horario: e.target.value })} placeholder="Seg a Sáb 7h–20h" className="campo" />
      </Campo>
      <Campo rotulo="Endereço" className="sm:col-span-2">
        <input value={dados.endereco} onChange={(e) => atualizar({ endereco: e.target.value })} placeholder="Rua, número · Bairro · Cidade" className="campo" />
      </Campo>
    </div>
  )
}

/* ================================ Prévia ================================ */
const PREVIAS: { id: string; nome: string; formato: Formato; variacao: string; produto: number }[] = [
  { id: 'fa', nome: 'Feed', formato: 'feed', variacao: 'a', produto: 0 },
  { id: 'fb', nome: 'Feed 2', formato: 'feed', variacao: 'b', produto: 1 },
  { id: 'st', nome: 'Story', formato: 'story', variacao: 'a', produto: 3 },
]

function Previa() {
  const marca = useMarcaAtual()
  const [atual, setAtual] = useState(PREVIAS[0])
  const t = buscarTemplate('oferta-explosao')!
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="rotulo">Prévia com a sua marca</div>
        <div className="flex gap-1">
          {PREVIAS.map((p) => (
            <button key={p.id} onClick={() => setAtual(p)}
              className={clsx('rounded-full px-3 py-1.5 text-sm font-semibold', atual.id === p.id ? 'bg-tinta text-white' : 'bg-zinc-100 text-zinc-700')}>
              {p.nome}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center">
        <ArtboardPreview key={atual.formato} formato={atual.formato} paleta={marca.paleta} larguraMax={atual.formato === 'story' ? 260 : 420} className="rounded-lg shadow-lg">
          <t.Componente marca={marca} itens={[PRODUTOS_AMOSTRA[atual.produto]]} formato={atual.formato} variacao={atual.variacao} campos={camposPadrao(t.manifest)} />
        </ArtboardPreview>
      </div>
    </div>
  )
}

/* ================================ UI ================================ */
function Cartao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-display text-2xl font-extrabold uppercase">{titulo}</h2>
      {children}
    </section>
  )
}

function Campo({ rotulo, children, className }: { rotulo: string; children: ReactNode; className?: string }) {
  return (
    <label className={clsx('block', className)}>
      <span className="mb-1.5 block text-sm font-semibold text-zinc-700">{rotulo}</span>
      {children}
    </label>
  )
}

function Aviso({ children }: { children: ReactNode }) {
  return <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"><TriangleAlert size={16} className="mt-0.5 shrink-0" />{children}</p>
}

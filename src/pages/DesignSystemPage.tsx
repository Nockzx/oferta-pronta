import { useState, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { ArtboardPreview, Carimbo, FORMATOS, Pilula, Preco, PrecoAntigo, Tarja, TIPO, PRECO, ESPACO, type EstiloPreco, type Formato } from '@/design'
import { paletaParaVars } from '@/brand/vars'
import { MARCA_DISTRIBUIDORA, MARCA_MERCADO, PRODUTOS_AMOSTRA } from '@/lib/amostras'
import { TEMPLATES } from '@/templates/registry'
import { camposPadrao, type ItemOferta } from '@/templates/types'
import { useMarcaAtual } from '@/brand/store'
import type { Marca } from '@/brand/types'
import '@/design/art.css'

const MARCAS = [MARCA_MERCADO, MARCA_DISTRIBUIDORA]
const NOME_LONGO: Partial<ItemOferta> = { nome: 'Sabão em pó concentrado lavagem perfeita', detalhe: 'pacote 1,6 kg' }

export function DesignSystemPage() {
  const [marcaIdx, setMarcaIdx] = useState(0)
  const [formato, setFormato] = useState<Formato>('feed')
  const [variacao, setVariacao] = useState('a')
  const [produtoIdx, setProdutoIdx] = useState(0)
  const [nomeLongo, setNomeLongo] = useState(false)

  const minhaMarca = useMarcaAtual()
  const marcas = [...MARCAS, minhaMarca]
  const marca = marcas[marcaIdx]
  const t = TEMPLATES[0]
  const item = { ...PRODUTOS_AMOSTRA[produtoIdx], ...(nomeLongo ? NOME_LONGO : {}) }

  return (
    <div className="space-y-14">
      <header>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-500">Etapa 2 · componentes reais em React</p>
        <h1 className="mt-2 font-display text-5xl font-black uppercase leading-none">Design system</h1>
        <p className="mt-3 max-w-2xl text-zinc-600">Tudo nesta página é renderizado pelos mesmos componentes que vão gerar os PNGs. Troque marca, formato e produto para ver o modelo se reorganizar.</p>
      </header>

      {/* ------------------------- Modelo ao vivo ------------------------- */}
      <section>
        <Titulo n="1" texto={`Modelo ao vivo · ${t.manifest.nome}`} />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
            <Grupo rotulo="Marca">
              {marcas.map((m, i) => (
                <Chip key={i} ativo={i === marcaIdx} onClick={() => setMarcaIdx(i)}>
                  <span className="mr-1.5 inline-block h-3 w-3 rounded-full align-middle" style={{ background: m.paleta.primaria }} />
                  {i === MARCAS.length ? 'Minha marca' : m.nome}
                </Chip>
              ))}
            </Grupo>
            <Grupo rotulo="Formato">
              {t.manifest.formatos.map((f) => (
                <Chip key={f} ativo={f === formato} onClick={() => setFormato(f)}>{FORMATOS[f].nome}</Chip>
              ))}
            </Grupo>
            <Grupo rotulo="Variação de layout">
              {t.manifest.variacoes.map((v) => (
                <Chip key={v.id} ativo={v.id === variacao} onClick={() => setVariacao(v.id)}>{v.nome}</Chip>
              ))}
            </Grupo>
            <Grupo rotulo="Produto">
              {PRODUTOS_AMOSTRA.map((p, i) => (
                <Chip key={p.id} ativo={i === produtoIdx} onClick={() => setProdutoIdx(i)}>{p.nome}</Chip>
              ))}
            </Grupo>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={nomeLongo} onChange={(e) => setNomeLongo(e.target.checked)} className="h-4 w-4 accent-black" />
              Testar nome muito longo (texto encolhe sozinho)
            </label>
          </div>
          <div className="flex justify-center">
            <ArtboardPreview
              key={formato}
              formato={formato}
              paleta={marca.paleta}
              larguraMax={formato === 'feed' ? 640 : formato === 'a4' ? 560 : 420}
              className="rounded-xl shadow-[0_24px_50px_-20px_rgba(0,0,0,.5)]"
            >
              <t.Componente marca={marca} itens={[item]} formato={formato} variacao={variacao} campos={camposPadrao(t.manifest)} />
            </ArtboardPreview>
          </div>
        </div>
      </section>

      {/* --------------------------- Preços --------------------------- */}
      <section>
        <Titulo n="2" texto="Estilos de preço" />
        <Palco marca={marca}>
          <div className="flex flex-wrap items-end gap-x-14 gap-y-10">
            {(
              [
                ['livre', 4.99, 'cada'],
                ['bloco', 39.9, 'cx c/12'],
                ['etiqueta', 29.98, 'o kg'],
                ['explosao', 7.49, 'cada'],
                ['fita', 1299.9, 'fardo c/6'],
              ] as [EstiloPreco, number, string][]
            ).map(([estilo, valor, un]) => (
              <figure key={estilo} className="flex flex-col items-start gap-3">
                <Preco estilo={estilo} valor={valor} unidade={un} tamanho={110} />
                <figcaption className="rotulo">{estilo}{valor > 999 ? ' · milhar encolhe' : ''}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10"><PrecoAntigo valor={6.49} tamanho={36} sufixo="por" /></div>
        </Palco>
      </section>

      {/* --------------------------- Selos --------------------------- */}
      <section>
        <Titulo n="3" texto="Selos e faixas" />
        <Palco marca={marca}>
          <div className="flex flex-wrap items-center gap-12">
            <Tarja tamanho={60}>Só hoje</Tarja>
            <Tarja tamanho={46} alerta>Oferta relâmpago</Tarja>
            <Carimbo linha1="Leve 12" linha2="pague 10" tamanho={170} />
            <Pilula tamanho={26}>Atacado</Pilula>
            <Pilula tamanho={26} fundo="var(--p)" cor="var(--onp)">Mín. 5 cx</Pilula>
          </div>
        </Palco>
      </section>

      {/* --------------------------- Tokens --------------------------- */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="rotulo mb-3">Escala tipográfica</h3>
          {Object.entries(TIPO).map(([k, v]) => <Linha key={k} k={k} v={v} />)}
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="rotulo mb-3">Escala de preço</h3>
          {Object.entries(PRECO).map(([k, v]) => <Linha key={k} k={k} v={v} />)}
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="rotulo mb-3">Espaçamento</h3>
          {Object.entries(ESPACO).map(([k, v]) => (
            <div key={k} className="flex items-center gap-3 py-1 text-sm">
              <span className="w-10 text-zinc-500">s-{k}</span>
              <span className="h-3 rounded bg-tinta" style={{ width: v / 1.2 }} />
              <span className="text-zinc-500">{v}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Titulo({ n, texto }: { n: string; texto: string }) {
  return <h2 className="mb-4 font-display text-3xl font-extrabold uppercase">{n} · {texto}</h2>
}

function Grupo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <div className="rotulo mb-2">{rotulo}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx('min-h-10 rounded-full px-3.5 py-2 text-sm font-semibold transition', ativo ? 'bg-tinta text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200')}
    >
      {children}
    </button>
  )
}

/** Área com as variáveis de cor da marca, para exibir componentes de arte fora de uma prancheta. */
function Palco({ marca, children }: { marca: Marca; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl shadow-sm">
      <div className="op-art !w-auto min-w-[900px] p-10" style={paletaParaVars(marca.paleta)}>{children}</div>
    </div>
  )
}

function Linha({ k, v }: { k: string; v: number }) {
  return (
    <div className="flex justify-between border-b border-dashed border-zinc-200 py-1.5 text-sm last:border-0">
      <span className="font-semibold">{k}</span>
      <span className="text-zinc-500">{v}</span>
    </div>
  )
}

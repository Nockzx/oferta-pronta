import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

export function InicioPage() {
  return (
    <section className="py-10">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-500">Etapa 3 · marca</p>
      <h1 className="mt-2 font-display text-5xl font-black uppercase leading-[.95] sm:text-6xl">Artes de oferta com a cara da sua marca</h1>
      <p className="mt-4 max-w-xl text-lg text-zinc-600">O cadastro, o editor e os modelos chegam nas próximas etapas. Por enquanto, envie sua logo e veja as artes ganharem as suas cores.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/marca" className="inline-flex items-center gap-2 rounded-full bg-tinta px-5 py-3 font-semibold text-white">
          Configurar minha marca <ArrowRight size={18} />
        </Link>
        <Link to="/design-system" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold">
          Ver design system
        </Link>
      </div>
    </section>
  )
}

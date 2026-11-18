import { NavLink, Outlet } from 'react-router'
import { clsx } from 'clsx'

export function Layout() {
  const link = ({ isActive }: { isActive: boolean }) =>
    clsx('px-3 py-2 rounded-full text-sm font-semibold transition', isActive ? 'bg-tinta text-white' : 'text-zinc-600 hover:bg-zinc-200')
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-papel/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-alerta font-preco text-lg text-ouro">R$</span>
            <span className="font-display text-xl font-black uppercase tracking-tight">OfertaPronta</span>
          </NavLink>
          <nav className="flex gap-1">
            <NavLink to="/design-system" className={link}>Design system</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        <Outlet />
      </main>
    </div>
  )
}

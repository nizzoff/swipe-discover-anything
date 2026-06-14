import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Heart, Home, Search, User } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/search", label: "Recherche", icon: Search },
  { to: "/favorites", label: "Favoris", icon: Heart },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/profile", label: "Profil", icon: User },
] as const;

export function SwipeItShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed -right-28 -top-32 h-80 w-80 rounded-full bg-primary/12 blur-3xl" />
      <div className={`relative mx-auto min-h-screen pb-28 md:pb-10 ${wide ? "max-w-7xl" : "max-w-5xl"}`}>
        {children}
      </div>
      <nav aria-label="Navigation principale" className="glass fixed inset-x-3 bottom-3 z-50 mx-auto grid max-w-xl grid-cols-5 rounded-[1.5rem] p-1.5 shadow-2xl md:bottom-6">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return <Link key={to} to={to} className={`group flex min-w-0 flex-col items-center gap-1 rounded-[1.15rem] px-1 py-2.5 text-[9px] font-semibold uppercase tracking-[.08em] transition-all duration-300 ${active ? "bg-primary text-primary-foreground shadow-[var(--shadow-blue)]" : "text-muted-foreground hover:text-foreground"}`}>
            <Icon className={`h-5 w-5 transition-transform group-active:scale-90 ${active ? "fill-primary/20" : ""}`} />
            <span className="truncate">{label}</span>
          </Link>;
        })}
      </nav>
    </div>
  );
}

export function PageHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 px-5 pb-6 pt-10 sm:px-8 sm:pt-14">
    <div className="min-w-0">
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>}
      <h1 className="truncate font-display text-2xl font-semibold uppercase tracking-[-.05em] sm:text-4xl">{title}</h1>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </header>;
}
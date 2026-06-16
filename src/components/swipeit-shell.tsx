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
      {/* Ambient glow effects */}
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none fixed -left-32 top-1/2 h-72 w-72 rounded-full bg-primary/8 blur-[80px]" />
      <div className="pointer-events-none fixed right-1/4 bottom-0 h-52 w-52 rounded-full bg-purple-500/5 blur-[60px]" />

      <div className={`relative mx-auto min-h-screen pb-28 md:pb-10 ${wide ? "max-w-7xl" : "max-w-5xl"}`}>
        {children}
      </div>

      {/* Modern navigation */}
      <nav
        aria-label="Navigation principale"
        className="glass fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between rounded-2xl p-1.5 shadow-[var(--shadow-glow)] md:bottom-6 md:max-w-md"
      >
        {nav.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`group relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] transition-all duration-300 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute inset-0 rounded-xl bg-primary/15" />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <Icon
                  className={`h-5 w-5 transition-transform duration-300 group-active:scale-90 ${
                    active ? "glow-primary" : ""
                  }`}
                />
                <span className="truncate">{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 px-5 pb-6 pt-10 sm:px-8 sm:pt-14">
      <div className="min-w-0 animate-slide-up">
        {eyebrow && (
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="truncate font-display text-2xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
      </div>
      {action && <div className="shrink-0 animate-fade-in">{action}</div>}
    </header>
  );
}

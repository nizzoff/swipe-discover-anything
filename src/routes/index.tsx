import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Crown, Flame, Orbit } from "lucide-react";
import { SwipeItShell } from "@/components/swipeit-shell";
import { PaywallGuard } from "@/components/paywall";
import { categories } from "@/lib/swipeit-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SwipeIt — Découvrez votre prochaine obsession" },
      { name: "description", content: "Choisissez une catégorie et swipez pour découvrir musique, films, restaurants et expériences." },
      { property: "og:title", content: "SwipeIt — Discover anything" },
      { property: "og:description", content: "La découverte universelle, un swipe à la fois." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PaywallGuard>
      <SwipeItShell wide>
        {/* Header */}
        <header className="flex items-center justify-between gap-4 px-5 pb-4 pt-8 sm:px-8 sm:pt-12">
          <div className="min-w-0 animate-slide-up">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Bonjour Baptiste
            </p>
            <h1 className="mt-2 truncate font-display text-2xl font-bold">
              SwipeIt<span className="text-primary">.</span>
            </h1>
          </div>
          <span className="glass-subtle flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <Flame className="h-4 w-4 fill-primary text-primary" />
            <span className="text-primary">7</span>
          </span>
        </header>

        <main className="px-5 sm:px-8">
          {/* Hero section */}
          <div className="mb-8 max-w-3xl pt-8 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="mb-4 flex items-center gap-2.5 text-primary">
              <Orbit className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Discover anything</span>
            </div>
            <h2 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Que veux-tu découvrir{" "}
              <span className="text-muted-foreground">aujourd'hui ?</span>
            </h2>
          </div>

          {/* Categories grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {categories.map((category, index) => (
              <Link
                key={category.key}
                to="/swipe/$category"
                params={{ category: category.key }}
                className={`group animate-rise relative min-h-48 overflow-hidden rounded-2xl ring-1 ring-border/50 transition-all duration-500 hover:-translate-y-2 hover:ring-primary/40 ${
                  index === 0 || index === 6 ? "md:col-span-2 md:min-h-56" : ""
                }`}
                style={{ animationDelay: `${0.2 + index * 0.06}s` }}
              >
                <img
                  src={category.image}
                  alt=""
                  width={1024}
                  height={1024}
                  className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale-[30%] transition-all duration-700 group-hover:scale-110 group-hover:opacity-80 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">
                      {category.eyebrow}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold tracking-tight">
                      {category.label}
                    </h3>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background/50 text-foreground backdrop-blur-xl transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[var(--shadow-glow)]">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Premium CTA */}
          <Link
            to="/premium"
            className="mt-6 group relative overflow-hidden rounded-2xl animate-slide-up"
            style={{ animationDelay: "0.65s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(circle at 80% 50%, oklch(0.78 0.16 210 / 0.2), transparent 50%)" }} />
            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5 ring-1 ring-primary/20 transition group-hover:ring-primary/40">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                    SwipeIt+
                  </span>
                </div>
                <h3 className="mt-1.5 truncate font-display text-lg font-bold">
                  Débloquez la découverte sans limites
                </h3>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </main>
      </SwipeItShell>
    </PaywallGuard>
  );
}

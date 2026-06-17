import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
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
  const [query, setQuery] = useState("");
  return (
    <PaywallGuard>
      <SwipeItShell wide>
        <header className="px-5 pt-10 sm:px-8 sm:pt-14">
          <div className="animate-slide-up">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Bonjour Baptiste
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              SwipeIt<span className="text-primary">.</span>
            </h1>
          </div>
        </header>

        <main className="px-5 pt-6 sm:px-8">
          {/* Search bar */}
          <form
            action="/search"
            className="animate-slide-up glass-subtle flex items-center gap-3 rounded-2xl px-4 py-3 transition focus-within:ring-2 focus-within:ring-primary/40"
            style={{ animationDelay: "0.05s" }}
          >
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher musique, films, jeux..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </form>

          {/* Hero */}
          <h2
            className="mt-8 text-balance font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Que veux-tu découvrir{" "}
            <span className="text-muted-foreground">aujourd'hui ?</span>
          </h2>

          {/* Categories — one per line */}
          <ul className="mt-6 flex flex-col gap-3">
            {categories.map((category, index) => (
              <li key={category.key}>
                <Link
                  to="/swipe/$category"
                  params={{ category: category.key }}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-2xl ring-1 ring-border/50 transition-all duration-300 hover:ring-primary/40 animate-rise"
                  style={{ animationDelay: `${0.15 + index * 0.04}s` }}
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden sm:h-24 sm:w-32">
                    <img
                      src={category.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/40" />
                  </div>
                  <div className="min-w-0 flex-1 py-3 pr-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      {category.eyebrow}
                    </p>
                    <h3 className="mt-1 truncate font-display text-lg font-bold tracking-tight">
                      {category.label}
                    </h3>
                  </div>
                  <span className="mr-4 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/60 text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </main>
      </SwipeItShell>
    </PaywallGuard>
  );
}

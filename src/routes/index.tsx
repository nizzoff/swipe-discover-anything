import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Bell, ChevronRight, Flame } from "lucide-react";
import { SwipeItShell } from "@/components/swipeit-shell";
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
    <SwipeItShell wide>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 pb-4 pt-8 sm:px-8 sm:pt-12">
        <div className="min-w-0"><p className="text-sm text-muted-foreground">Bonjour Baptiste</p><h1 className="truncate font-display text-3xl font-semibold tracking-tight">SwipeIt<span className="text-primary">.</span></h1></div>
        <div className="flex shrink-0 gap-2"><span className="glass flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-foreground"><Flame className="h-4 w-4 fill-primary text-primary" /> 7</span><button aria-label="Notifications" className="glass grid h-10 w-10 place-items-center rounded-full"><Bell className="h-4.5 w-4.5" /></button></div>
      </header>
      <main className="px-5 sm:px-8">
        <div className="mb-7 max-w-2xl pt-5"><p className="text-sm font-semibold text-primary">Discover anything.</p><h2 className="mt-2 text-balance font-display text-3xl font-semibold leading-tight sm:text-5xl">Que veux-tu découvrir aujourd'hui ?</h2></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {categories.map((category, index) => <Link key={category.key} to="/swipe/$category" params={{ category: category.key }} className={`group animate-rise relative min-h-44 overflow-hidden rounded-3xl ring-1 ring-border transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${index === 0 || index === 6 ? "md:col-span-2" : ""}`} style={{ animationDelay: `${index * 55}ms` }}>
            <img src={category.image} alt="" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">{category.eyebrow}</p><h3 className="mt-1 font-display text-xl font-semibold">{category.label}</h3></div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground/10 backdrop-blur-xl transition group-hover:bg-primary"><ChevronRight className="h-4 w-4" /></span></div>
          </Link>)}
        </div>
        <Link to="/premium" className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-primary/25 via-card to-card p-5 ring-1 ring-primary/30 transition hover:ring-primary/60"><div className="min-w-0"><span className="text-xs font-bold text-primary">SWIPEIT+</span><h3 className="mt-1 truncate font-display text-lg font-semibold">Débloquez la découverte sans limites</h3></div><ChevronRight className="h-5 w-5 text-primary" /></Link>
      </main>
    </SwipeItShell>
  );
}

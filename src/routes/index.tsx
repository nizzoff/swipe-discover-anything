import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Bell, ChevronRight, Flame, Orbit } from "lucide-react";
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
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 pb-4 pt-8 sm:px-8 sm:pt-12">
        <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-muted-foreground">Bonjour Baptiste</p><h1 className="mt-2 truncate font-display text-2xl font-semibold uppercase tracking-[-.07em]">SwipeIt<span className="text-primary">.</span></h1></div>
        <div className="flex shrink-0 gap-2"><span className="glass flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-foreground"><Flame className="h-4 w-4 fill-primary text-primary" /> 7</span><button aria-label="Notifications" className="glass grid h-10 w-10 place-items-center rounded-full"><Bell className="h-4.5 w-4.5" /></button></div>
      </header>
      <main className="px-5 sm:px-8">
        <div className="mb-7 max-w-3xl pt-7"><div className="mb-5 flex items-center gap-2 text-primary"><Orbit className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[.24em]">Discover anything</span></div><h2 className="text-balance text-4xl font-medium leading-[.98] tracking-[-.055em] sm:text-6xl">Que veux-tu découvrir <span className="text-muted-foreground">aujourd'hui&nbsp;?</span></h2></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {categories.map((category, index) => <Link key={category.key} to="/swipe/$category" params={{ category: category.key }} className={`group animate-rise relative min-h-44 overflow-hidden rounded-[1.65rem] ring-1 ring-border transition duration-300 hover:-translate-y-1 hover:ring-primary/40 ${index === 0 || index === 6 ? "md:col-span-2" : ""}`} style={{ animationDelay: `${index * 55}ms` }}>
            <img src={category.image} alt="" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover opacity-55 grayscale-[20%] transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
             <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[.22em] text-primary">{category.eyebrow}</p><h3 className="mt-1 text-lg font-semibold tracking-tight">{category.label}</h3></div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground/10 backdrop-blur-xl transition group-hover:bg-primary group-hover:text-primary-foreground"><ChevronRight className="h-4 w-4" /></span></div>
          </Link>)}
        </div>
        <Link to="/premium" className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-primary/25 via-card to-card p-5 ring-1 ring-primary/30 transition hover:ring-primary/60"><div className="min-w-0"><span className="text-xs font-bold text-primary">SWIPEIT+</span><h3 className="mt-1 truncate font-display text-lg font-semibold">Débloquez la découverte sans limites</h3></div><ChevronRight className="h-5 w-5 text-primary" /></Link>
      </main>
    </SwipeItShell>
    </PaywallGuard>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DiscoverCard } from "@/components/discover-card";
import { PaywallGuard } from "@/components/paywall";
import { Button } from "@/components/ui/button";
import { categoryByKey, items, sponsoredItem } from "@/lib/swipeit-data";
import { useSwipeIt } from "@/lib/swipeit-store";

export const Route = createFileRoute("/swipe/$category")({ component: SwipePage });

function SwipePage() {
  const { category } = Route.useParams();
  const meta = categoryByKey(category);
  const deck = useMemo(() => items.filter((item) => item.category === meta.key), [meta.key]);
  const [index, setIndex] = useState(0);
  const [adCountdown, setAdCountdown] = useState(5);
  const { registerSwipe } = useSwipeIt();
  const current = index > 0 && index % 20 === 0 ? sponsoredItem : deck[index % deck.length];

  useEffect(() => {
    if (!current.sponsored) return;
    setAdCountdown(5);
    const timer = window.setInterval(() => setAdCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [current.id, index]);

  return <PaywallGuard><main className="relative min-h-screen overflow-hidden bg-background px-4 pb-8 pt-5 text-foreground before:pointer-events-none before:absolute before:-right-24 before:-top-24 before:h-72 before:w-72 before:rounded-full before:bg-primary/15 before:blur-3xl">
    <header className="mx-auto grid max-w-3xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 pb-5">
      <Button asChild variant="glass" size="icon" className="rounded-full"><Link to="/"><ArrowLeft /></Link></Button>
      <div className="min-w-0 text-center"><p className="text-[9px] font-bold uppercase tracking-[.24em] text-primary">{meta.eyebrow}</p><h1 className="truncate font-display text-sm font-semibold uppercase tracking-[-.04em]">{meta.label}</h1></div>
      <span className="glass rounded-full px-3 py-2 text-xs font-bold">{(index % deck.length) + 1}/{deck.length}</span>
    </header>
    <div className="mx-auto max-w-[430px] pb-5"><div className="h-1 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((index % deck.length) + 1) / deck.length * 100}%` }} /></div></div>
    <DiscoverCard key={`${current.id}-${index}`} item={current} countdown={adCountdown} onDecision={(liked) => { registerSwipe(current, liked); setIndex((value) => value + 1); }} />
    <p className="mt-6 text-center text-xs text-muted-foreground">Glissez la carte ou utilisez les boutons</p>
    {index > 0 && <button onClick={() => setIndex((value) => Math.max(0, value - 1))} className="mx-auto mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"><RotateCcw className="h-3.5 w-3.5" /> Annuler le dernier swipe</button>}
  </main></PaywallGuard>;
}
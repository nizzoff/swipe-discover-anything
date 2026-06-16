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

  return (
    <PaywallGuard>
      <main className="relative min-h-screen overflow-hidden bg-background px-4 pb-8 pt-5 text-foreground">
        {/* Background glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/12 blur-[100px]" />
        <div className="pointer-events-none absolute -left-32 top-1/3 h-56 w-56 rounded-full bg-primary/8 blur-[80px]" />

        {/* Header */}
        <header className="relative mx-auto grid max-w-3xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 pb-5 animate-slide-up">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              {meta.eyebrow}
            </p>
            <h1 className="mt-0.5 truncate font-display text-base font-bold uppercase tracking-tight">
              {meta.label}
            </h1>
          </div>
          <span className="glass-subtle rounded-full px-4 py-2 text-xs font-bold">
            {(index % deck.length) + 1}/{deck.length}
          </span>
        </header>

        {/* Progress bar */}
        <div className="relative mx-auto max-w-[430px] pb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
              style={{ width: `${((index % deck.length) + 1) / deck.length * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="animate-scale-in" style={{ animationDelay: "0.15s" }}>
          <DiscoverCard
            key={`${current.id}-${index}`}
            item={current}
            countdown={adCountdown}
            onDecision={(liked) => {
              registerSwipe(current, liked);
              setIndex((value) => value + 1);
            }}
          />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Glissez la carte ou utilisez les boutons
        </p>

        {index > 0 && (
          <button
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            className="mx-auto mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground animate-fade-in"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Annuler le dernier swipe
          </button>
        )}
      </main>
    </PaywallGuard>
  );
}

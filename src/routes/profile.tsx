import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, ChevronRight, Crown, Flame, Heart, Settings, Zap } from "lucide-react";
import { SettingsPanel } from "@/components/settings-panel";
import { PageHeader, SwipeItShell } from "@/components/swipeit-shell";
import { PaywallGuard } from "@/components/paywall";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSwipeIt } from "@/lib/swipeit-store";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profil — SwipeIt" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { swipes, favorites, minutes } = useSwipeIt();

  return (
    <PaywallGuard>
      <SwipeItShell>
        <PageHeader
          eyebrow="Votre espace"
          title="Profil"
          action={
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Parametres">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[min(92vw,26rem)] border-border bg-background/95 p-5 backdrop-blur-2xl">
                <SheetHeader className="pr-8 text-left">
                  <SheetTitle className="font-display text-xl font-bold">Parametres</SheetTitle>
                  <SheetDescription>Personnalisez votre experience SwipeIt.</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <SettingsPanel />
                </div>
              </SheetContent>
            </Sheet>
          }
        />

        <main className="px-5 sm:px-8">
          {/* Profile info */}
          <section className="flex flex-col items-center text-center animate-slide-up">
            <div className="relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 font-display text-2xl font-bold shadow-[var(--shadow-glow)]">
              BD
              <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-3 border-background bg-success text-xs font-bold">
                12
              </span>
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">Baptiste Demo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Explorateur niveau 12</p>
          </section>

          {/* Stats */}
          <section className="mt-6 grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <article className="glass-subtle rounded-xl p-4 text-center">
              <Zap className="mx-auto h-4 w-4 text-primary" />
              <b className="mt-2 block font-display text-lg">{swipes}</b>
              <span className="text-[10px] text-muted-foreground">Swipes</span>
            </article>
            <article className="glass-subtle rounded-xl p-4 text-center">
              <Heart className="mx-auto h-4 w-4 text-primary" />
              <b className="mt-2 block font-display text-lg">{favorites.length + 87}</b>
              <span className="text-[10px] text-muted-foreground">Likes</span>
            </article>
            <article className="glass-subtle rounded-xl p-4 text-center">
              <Flame className="mx-auto h-4 w-4 text-primary" />
              <b className="mt-2 block font-display text-lg">{minutes}m</b>
              <span className="text-[10px] text-muted-foreground">Temps</span>
            </article>
          </section>

          {/* Premium CTA */}
          <Link
            to="/premium"
            className="mt-6 group relative overflow-hidden rounded-2xl animate-slide-up"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />
            <div className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4 ring-1 ring-primary/20 transition group-hover:ring-primary/40">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Crown className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display font-bold">Passez a SwipeIt+</p>
                <p className="truncate text-xs text-muted-foreground">Recommandations IA et favoris illimites</p>
              </div>
              <ChevronRight className="h-5 w-5 text-primary" />
            </div>
          </Link>

          {/* Badges */}
          <section className="mt-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Badges</h2>
              <span className="text-xs font-semibold text-primary">8 debloques</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[Award, Flame, Heart].map((Icon, i) => (
                <div
                  key={i}
                  className="glass-subtle rounded-xl p-4 text-center transition hover:border-primary/30"
                >
                  <Icon className="mx-auto h-6 w-6 text-primary" />
                  <span className="mt-2 block text-[10px] font-semibold">
                    {i === 0 ? "Curieux" : i === 1 ? "7 jours" : "Coup de cœur"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </SwipeItShell>
    </PaywallGuard>
  );
}

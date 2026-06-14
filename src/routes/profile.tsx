import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, ChevronRight, Crown, Flame, Heart, Settings, Zap } from "lucide-react";
import { SettingsPanel } from "@/components/settings-panel";
import { PageHeader, SwipeItShell } from "@/components/swipeit-shell";
import { PaywallGuard } from "@/components/paywall";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSwipeIt } from "@/lib/swipeit-store";

export const Route = createFileRoute("/profile")({ head: () => ({ meta: [{ title: "Profil — SwipeIt" }] }), component: ProfilePage });
function ProfilePage() {
  const { swipes, favorites, minutes } = useSwipeIt();
  return <PaywallGuard><SwipeItShell><PageHeader eyebrow="Votre espace" title="Profil" action={<Sheet>
    <SheetTrigger asChild><Button variant="glass" size="icon" className="rounded-full" aria-label="Ouvrir les paramètres"><Settings /></Button></SheetTrigger>
    <SheetContent className="w-[min(92vw,26rem)] border-border bg-background/95 p-5 backdrop-blur-2xl">
      <SheetHeader className="pr-8 text-left">
        <SheetTitle className="font-display text-xl uppercase tracking-[-.04em]">Paramètres</SheetTitle>
        <SheetDescription>Personnalisez votre expérience SwipeIt.</SheetDescription>
      </SheetHeader>
      <div className="mt-7"><SettingsPanel /></div>
    </SheetContent>
  </Sheet>} />
    <main className="px-5 sm:px-8"><section className="flex flex-col items-center text-center"><div className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-primary to-chart-4 font-display text-3xl font-semibold shadow-[var(--shadow-blue)]">BD<span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-4 border-background bg-success text-xs">✓</span></div><h2 className="mt-4 font-display text-2xl font-semibold">Baptiste Demo</h2><p className="mt-1 text-sm text-muted-foreground">Explorateur niveau 12</p></section>
      <section className="mt-7 grid grid-cols-3 gap-3"><article className="rounded-2xl bg-card p-4 text-center ring-1 ring-border"><Zap className="mx-auto h-4 w-4 text-primary" /><b className="mt-2 block font-display text-lg">{swipes}</b><span className="text-[10px] text-muted-foreground">Swipes</span></article><article className="rounded-2xl bg-card p-4 text-center ring-1 ring-border"><Heart className="mx-auto h-4 w-4 text-primary" /><b className="mt-2 block font-display text-lg">{favorites.length + 87}</b><span className="text-[10px] text-muted-foreground">Likes</span></article><article className="rounded-2xl bg-card p-4 text-center ring-1 ring-border"><Flame className="mx-auto h-4 w-4 text-primary" /><b className="mt-2 block font-display text-lg">{minutes}m</b><span className="text-[10px] text-muted-foreground">Temps</span></article></section>
      <Link to="/premium" className="mt-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-3xl bg-gradient-to-r from-primary/30 to-card p-5 ring-1 ring-primary/35"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground"><Crown /></span><div className="min-w-0"><p className="font-display font-semibold">Passez à SwipeIt+</p><p className="truncate text-xs text-muted-foreground">Recommandations IA et favoris illimités</p></div><ChevronRight className="h-5 w-5" /></Link>
      <section className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Badges</h2><span className="text-xs text-primary">8 débloqués</span></div><div className="grid grid-cols-3 gap-3">{[[Award,"Curieux"],[Flame,"7 jours"],[Heart,"Coup de cœur"]].map(([Icon,label]) => { const BadgeIcon = Icon as typeof Award; return <div key={label as string} className="rounded-2xl bg-card p-4 text-center ring-1 ring-border"><BadgeIcon className="mx-auto h-6 w-6 text-primary" /><span className="mt-2 block text-[10px] font-semibold">{label as string}</span></div>; })}</div></section>
      <section className="mt-7 pb-5"><h2 className="mb-3 font-display text-lg font-semibold">Paramètres</h2><SettingsPanel /></section>
    </main>
  </SwipeItShell></PaywallGuard>;
}
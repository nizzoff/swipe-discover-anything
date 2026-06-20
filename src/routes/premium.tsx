import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, BrainCircuit, Check, Crown, EyeOff, Heart, History, KeyRound, Loader as Loader2, Rocket, Sparkles, Tag } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { useSubscription, validatePromoCode, type PlanType } from "@/lib/use-subscription";
import { redeemPromoCode } from "@/lib/promo.functions";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "SwipeIt+ — Abonnement requis" },
      { name: "description", content: "Abonnez-vous à SwipeIt pour accéder à toutes les fonctionnalités." },
    ],
  }),
  component: PremiumPage,
});

const features = [
  [EyeOff, "Aucune publicité"],
  [Heart, "Favoris illimités"],
  [History, "Historique complet"],
  [BrainCircuit, "IA de recommandation avancée"],
  [BadgeCheck, "Badges exclusifs"],
  [Rocket, "Accès anticipé"],
] as const;

const plans: {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  savings?: string;
  badge?: string;
  popular?: boolean;
}[] = [
  {
    id: "monthly",
    name: "Mensuel",
    price: "4,99 €",
    period: "/ mois",
  },
  {
    id: "annual",
    name: "Annuel",
    price: "49,90 €",
    period: "/ an",
    savings: "Économisez 10 €",
    badge: "2 mois offerts",
    popular: true,
  },
  {
    id: "lifetime",
    name: "À vie",
    price: "99 €",
    period: "paiement unique",
    savings: "Pour toujours",
    badge: "Meilleure valeur",
  },
];

function PremiumPage() {
  const { checkout, hasAccess, subscription, loading, refresh } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<PlanType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [promoData, setPromoData] = useState<{ discount: number; discountType: "percent" | "amount"; message: string } | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const redeem = useServerFn(redeemPromoCode);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    setRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { error: sErr } = await supabase.auth.signInAnonymously();
        if (sErr) throw new Error("Impossible d'initialiser la session : " + sErr.message);
      }
      const result = await redeem({ data: { code: accessCode.trim() } });
      setRedeemSuccess(`Accès ${result.tier} activé !`);
      setAccessCode("");
      await refresh();
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : "Code invalide");
    } finally {
      setRedeeming(false);
    }
  };

  const handlePromoCheck = async () => {
    if (!promoCode.trim()) return;
    setPromoStatus("checking");
    setError(null);
    const result = await validatePromoCode(promoCode.trim());
    if (result.valid) {
      setPromoStatus("valid");
      setPromoData({ discount: result.discount!, discountType: result.discountType!, message: result.message! });
    } else {
      setPromoStatus("invalid");
      setError(result.error || "Code invalide");
      setPromoData(null);
    }
  };

  const handleSubscribe = async (planType: PlanType) => {
    setProcessingPlan(planType);
    setError(null);
    try {
      const code = promoStatus === "valid" ? promoCode.trim() : undefined;
      const url = await checkout(planType, code);
      if (url) window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="grid min-h-[70vh] place-items-center">
          <div className="text-center animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse-soft rounded-full bg-primary/20 blur-xl" />
              <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
      <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <div className="relative mx-auto max-w-lg px-5 pb-10 pt-6">
        <Button asChild variant="ghost" size="icon" className="rounded-xl">
          <Link to="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        {/* Hero */}
        <section className="mt-8 text-center animate-slide-up">
          <div className="relative mx-auto inline-block">
            <div className="absolute inset-0 animate-glow rounded-[1.75rem]" />
            <span className="relative grid h-20 w-20 place-items-center rounded-[1.5rem] bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-2xl">
              <Crown className="h-9 w-9" />
            </span>
          </div>
          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">La découverte réinventée</p>
          <h1 className="mt-4 font-display text-4xl font-bold">
            SwipeIt<span className="text-primary">+</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Plus de limites. Plus de contrôle. Des recommandations qui deviennent vraiment les vôtres.
          </p>
        </section>

        {hasAccess && subscription ? (
          <section className="mt-8 animate-scale-in">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-success/10 via-success/5 to-transparent ring-1 ring-success/20">
              <div className="flex items-center gap-3 p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-success/20">
                  <Sparkles className="h-5 w-5 text-success" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Abonnement actif</p>
                  <p className="text-xs text-muted-foreground">
                    Plan {subscription.planType === "monthly" ? "mensuel" : subscription.planType === "annual" ? "annuel" : "à vie"}
                  </p>
                </div>
                <Check className="h-5 w-5 text-success" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {features.map(([Icon, label]) => (
                <div key={label} className="glass-subtle flex items-start gap-2.5 rounded-xl p-3 animate-slide-up">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>

            <Button asChild variant="default" size="lg" className="mt-6 w-full rounded-xl">
              <Link to="/">Continuer à explorer</Link>
            </Button>
          </section>
        ) : (
          <>
            {/* Features */}
            <section className="mt-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="grid grid-cols-2 gap-3">
                {features.map(([Icon, label]) => (
                  <div key={label} className="glass-subtle flex items-start gap-2.5 rounded-xl p-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Promo code */}
            {/* Access code (grants Premium without payment) */}
            <form onSubmit={handleRedeem} className="mt-5 animate-slide-up" style={{ animationDelay: "0.12s" }}>
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 ring-1 ring-primary/30">
                <div className="mb-3 flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold">J'ai un code d'accès</h3>
                </div>
                <div className="flex gap-2">
                  <input
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value.toUpperCase());
                      setRedeemError(null);
                      setRedeemSuccess(null);
                    }}
                    placeholder="BATOUTEST"
                    className="w-full flex-1 rounded-lg border border-input/50 bg-background/80 px-3 py-2.5 text-sm font-mono tracking-widest outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                  />
                  <Button type="submit" disabled={!accessCode.trim() || redeeming} className="shrink-0">
                    {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activer"}
                  </Button>
                </div>
                {redeemError && (
                  <p className="mt-2 text-xs font-medium text-destructive">{redeemError}</p>
                )}
                {redeemSuccess && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-success">
                    <Sparkles className="h-3 w-3" /> {redeemSuccess}
                  </p>
                )}
              </div>
            </form>

            {/* Stripe discount promo code */}
            <div className="mt-3 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <div className="glass-subtle rounded-xl p-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoStatus("idle");
                        setPromoData(null);
                        setError(null);
                      }}
                      placeholder="Code promo de réduction"
                      className="w-full rounded-lg border border-input/50 bg-background/80 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePromoCheck}
                    disabled={!promoCode.trim() || promoStatus === "checking"}
                    className="shrink-0 px-4"
                  >
                    {promoStatus === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Appliquer"}
                  </Button>
                </div>
                {promoStatus === "valid" && promoData && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-success">
                    <Sparkles className="h-3 w-3" />
                    {promoData.message} appliqué
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive animate-scale-in">
                {error}
              </div>
            )}

            {/* Plans */}
            <section className="mt-5 space-y-3">
              {plans.map((plan, index) => (
                <button
                  key={plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processingPlan !== null}
                  className={`relative w-full rounded-2xl p-5 text-left transition-all duration-300 disabled:opacity-50 ${
                    plan.popular
                      ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent ring-1 ring-primary/30 hover:ring-primary/50"
                      : "glass-subtle hover:border-primary/30"
                  }`}
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                >
                  {promoStatus === "valid" && promoData && (
                    <span className="absolute left-4 top-4 rounded-md bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                      -{promoData.discountType === "percent" ? `${promoData.discount}%` : `${promoData.discount / 100}€`}
                    </span>
                  )}
                  {plan.badge && (
                    <span className="absolute right-4 top-4 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex items-start gap-4 pt-6">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="font-display text-2xl font-bold">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">{plan.period}</span>
                      </div>
                      {plan.savings && <p className="mt-1 text-xs text-primary">{plan.savings}</p>}
                    </div>
                    <div className="grid shrink-0 place-items-center">
                      {processingPlan === plan.id ? (
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10">
                          <Crown className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </section>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              14 jours d'essai gratuit. Paiement sécurisé par Stripe.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

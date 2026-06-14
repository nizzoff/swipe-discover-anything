import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, BrainCircuit, Check, Crown, EyeOff, Heart, History, Loader as Loader2, Rocket, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription, type PlanType } from "@/lib/use-subscription";

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
  highlight?: boolean;
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
    highlight: true,
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
  const { checkout, hasAccess, subscription, loading } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<PlanType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planType: PlanType) => {
    setProcessingPlan(planType);
    setError(null);

    try {
      const url = await checkout(planType);
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background px-5 pb-10 text-foreground">
        <div className="grid min-h-[60vh] place-items-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-5 pb-10 text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,var(--primary),transparent_58%)] opacity-25" />

      <div className="relative mx-auto max-w-lg pt-6">
        <Button asChild variant="glass" size="icon" className="rounded-full">
          <Link to="/">
            <ArrowLeft />
          </Link>
        </Button>

        <section className="mt-10 text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-primary text-primary-foreground shadow-[var(--shadow-blue)]">
            <Crown className="h-9 w-9" />
          </span>
          <p className="mt-7 text-[10px] font-bold uppercase tracking-[.27em] text-primary">
            La découverte réinventée
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold uppercase tracking-[-.07em]">
            SwipeIt<span className="text-primary">+</span>
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Plus de limites. Plus de contrôle. Des recommandations qui deviennent vraiment les vôtres.
          </p>
        </section>

        {hasAccess && subscription ? (
          <section className="mt-9 rounded-[2rem] bg-card/80 p-6 ring-1 ring-border backdrop-blur-xl">
            <div className="flex items-center gap-3 rounded-2xl bg-success/10 p-4 ring-1 ring-success/30">
              <Sparkles className="h-6 w-6 text-success" />
              <div>
                <p className="font-semibold text-foreground">Abonnement actif</p>
                <p className="text-xs text-muted-foreground">
                  Plan {subscription.planType === "monthly" ? "mensuel" : subscription.planType === "annual" ? "annuel" : "à vie"}
                </p>
              </div>
              <Check className="ml-auto h-5 w-5 text-success" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {features.map(([Icon, label]) => (
                <div key={label} className="flex items-start gap-3 rounded-2xl bg-secondary p-3">
                  <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
                  <span className="text-xs font-semibold leading-relaxed">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button asChild variant="premium" size="xl" className="w-full">
                <Link to="/">Continuer à explorer</Link>
              </Button>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-9 rounded-[2rem] bg-card/80 p-6 ring-1 ring-border backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-3">
                {features.map(([Icon, label]) => (
                  <div key={label} className="flex items-start gap-3 rounded-2xl bg-secondary p-3">
                    <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
                    <span className="text-xs font-semibold leading-relaxed">{label}</span>
                  </div>
                ))}
              </div>
            </section>

            {error && (
              <div className="mt-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <section className="mt-5 space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processingPlan !== null}
                  className={`relative w-full rounded-[1.5rem] p-5 text-left ring-1 transition disabled:opacity-50 ${
                    plan.highlight
                      ? "bg-primary/10 ring-primary/40 hover:ring-primary"
                      : "bg-card ring-border hover:ring-primary/40"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                      {plan.badge}
                    </span>
                  )}
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                      <div className="mt-1">
                        <span className="font-display text-2xl font-bold">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">{plan.period}</span>
                      </div>
                      {plan.savings && (
                        <p className="mt-1 text-xs text-primary">{plan.savings}</p>
                      )}
                    </div>
                    <div className="grid place-items-center">
                      {processingPlan === plan.id ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <Crown className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </section>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              14 jours d'essai gratuit. Annulable à tout moment.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import { Crown, Loader as Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription, type PlanType } from "@/lib/use-subscription";

const plans: { id: PlanType; name: string; price: string; period: string; badge?: string; features: string[] }[] = [
  {
    id: "monthly",
    name: "Mensuel",
    price: "4,99 €",
    period: "/ mois",
    features: ["Accès complet", "14 jours d'essai gratuit", "Annulable à tout moment"],
  },
  {
    id: "annual",
    name: "Annuel",
    price: "49,90 €",
    period: "/ an",
    badge: "2 mois offerts",
    features: ["Accès complet", "14 jours d'essai gratuit", "Économisez 10 €", "Support prioritaire"],
  },
  {
    id: "lifetime",
    name: "À vie",
    price: "99 €",
    period: "paiement unique",
    badge: "Meilleure valeur",
    features: ["Accès à vie", "Mises à jour incluses", "Support prioritaire", "Pas d'abonnement"],
  },
];

export function Paywall() {
  const { checkout, hasAccess, accessReason, loading } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<PlanType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Vérification de votre abonnement...</p>
        </div>
      </div>
    );
  }

  if (hasAccess) return null;

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 pb-8 pt-6 text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(circle_at_50%_0%,var(--primary),transparent_60%)] opacity-20" />

      <div className="relative mx-auto max-w-lg">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-[1.25rem] bg-primary text-primary-foreground shadow-[var(--shadow-blue)]">
            <Crown className="h-8 w-8" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-semibold uppercase tracking-[-.05em]">
            SwipeIt<span className="text-primary">+</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {accessReason === "payment_failed"
              ? "Le paiement n'a pas abouti. Veuillez réessayer."
              : accessReason === "canceled"
                ? "Votre abonnement a été annulé. Réabonnez-vous pour continuer."
                : "Débloquez l'accès complet à SwipeIt"}
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handleSubscribe(plan.id)}
              disabled={processingPlan !== null}
              className="relative w-full rounded-[1.5rem] bg-card p-5 text-left ring-1 ring-border transition hover:border-primary/40 hover:shadow-lg disabled:opacity-50"
            >
              {plan.badge && (
                <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-1">
                    <span className="font-display text-2xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-1 w-1 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                {processingPlan === plan.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Crown className="h-5 w-5 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Paiement sécurisé par Stripe. Annulable à tout moment.
        </p>
      </div>
    </div>
  );
}

export function PaywallGuard({ children }: { children: React.ReactNode }) {
  const { hasAccess, loading, accessReason } = useSubscription();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Paywall />;
  }

  return <>{children}</>;
}

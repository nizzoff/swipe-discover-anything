import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { getSupabaseUrl } from "./supabase-config";

export type PlanType = "monthly" | "annual" | "lifetime";
export type SubscriptionStatus = "inactive" | "trialing" | "active" | "past_due" | "canceled";
export type AccessReason =
  | "no_subscription"
  | "trial"
  | "active_subscription"
  | "lifetime"
  | "promo"
  | "payment_failed"
  | "canceled";

interface SubscriptionInfo {
  hasAccess: boolean;
  accessReason: AccessReason;
  subscription: {
    planType: PlanType;
    status: SubscriptionStatus;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  loading: boolean;
  error: string | null;
}

const SUPABASE_URL = getSupabaseUrl();

// Session VIP override: by default the current session has full access.
// Add `?paywall=1` to the URL to force the paywall, or `?paywall=0` to re-enable VIP.
function isVipSession(): boolean {
  if (typeof window === "undefined") return true;
  const params = new URLSearchParams(window.location.search);
  const force = params.get("paywall");
  if (force === "1") {
    sessionStorage.setItem("swipeit-vip", "0");
    return false;
  }
  if (force === "0") {
    sessionStorage.setItem("swipeit-vip", "1");
    return true;
  }
  return sessionStorage.getItem("swipeit-vip") !== "0";
}

export function useSubscription(): SubscriptionInfo & {
  checkout: (planType: PlanType, promoCode?: string) => Promise<string | null>;
  refresh: () => Promise<void>;
} {
  const [state, setState] = useState<SubscriptionInfo>({
    hasAccess: isVipSession(),
    accessReason: isVipSession() ? "promo" : "no_subscription",
    subscription: null,
    loading: !isVipSession(),
    error: null,
  });

  const fetchSubscription = async () => {
    if (isVipSession()) {
      setState({
        hasAccess: true,
        accessReason: "promo",
        subscription: null,
        loading: false,
        error: null,
      });
      return;
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setState({
          hasAccess: false,
          accessReason: "no_subscription",
          subscription: null,
          loading: false,
          error: null,
        });
        return;
      }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/check-subscription`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to check subscription");
      }

      const data = await res.json();
      setState({
        hasAccess: data.hasAccess,
        accessReason: data.accessReason,
        subscription: data.subscription,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  };

  useEffect(() => {
    fetchSubscription();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkout = async (planType: PlanType, promoCode?: string): Promise<string | null> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        await supabase.auth.signInAnonymously();
        const {
          data: { session: newSession },
        } = await supabase.auth.getSession();
        if (!newSession) {
          throw new Error("Failed to authenticate");
        }
      }

      const currentSession = (await supabase.auth.getSession()).data.session;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession?.access_token}`,
        },
        body: JSON.stringify({ planType, promoCode }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Checkout failed");
      }

      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      throw error;
    }
  };

  return {
    ...state,
    checkout,
    refresh: fetchSubscription,
  };
}

export async function validatePromoCode(
  code: string,
  planType?: PlanType
): Promise<{ valid: boolean; discount?: number; discountType?: "percent" | "amount"; message?: string; error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/validate-promo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, planType }),
    });

    const data = await res.json();
    return data;
  } catch {
    return { valid: false, error: "Erreur de validation" };
  }
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Power, Loader as Loader2 } from "lucide-react";
import {
  isAdmin,
  listPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
} from "@/lib/promo.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/promo-codes")({
  head: () => ({ meta: [{ title: "Codes promo — Admin" }] }),
  component: AdminPromoCodesPage,
});

type Tier = "premium" | "premium_plus" | "beta";

type CreateInput = {
  name?: string | null;
  code?: string | null;
  accessTier: Tier;
  maxUses?: number | null;
  expiresAt?: string | null;
  durationDays?: number | null;
};

type UpdateInput = {
  id: string;
  name?: string | null;
  isActive?: boolean;
  maxUses?: number | null;
  expiresAt?: string | null;
  durationDays?: number | null;
  accessTier?: Tier;
};

function AdminPromoCodesPage() {
  const checkAdmin = useServerFn(isAdmin);
  const adminQ = useQuery({ queryKey: ["isAdmin"], queryFn: () => checkAdmin() });

  if (adminQ.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminQ.data?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center">
        <div>
          <h1 className="text-xl font-bold">Accès refusé</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cette page est réservée aux administrateurs.
          </p>
          <Link to="/" className="mt-4 inline-block text-sm text-primary underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
}

function AdminPanel() {
  const qc = useQueryClient();
  const listFn = useServerFn(listPromoCodes);
  const createFn = useServerFn(createPromoCode);
  const updateFn = useServerFn(updatePromoCode);
  const deleteFn = useServerFn(deletePromoCode);

  const q = useQuery({ queryKey: ["promo-codes"], queryFn: () => listFn() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["promo-codes"] });

  const createM = useMutation({
    mutationFn: (input: CreateInput) => createFn({ data: input }),
    onSuccess: invalidate,
  });
  const updateM = useMutation({
    mutationFn: (input: UpdateInput) => updateFn({ data: input }),
    onSuccess: invalidate,
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: invalidate,
  });

  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/profile" className="rounded-lg p-2 hover:bg-secondary/50">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-2xl font-bold">Codes promo</h1>
          <Button
            onClick={() => setShowCreate((v) => !v)}
            size="sm"
            className="ml-auto"
          >
            <Plus className="h-4 w-4" />
            Nouveau
          </Button>
        </div>

        {showCreate && (
          <CreateForm
            onClose={() => setShowCreate(false)}
            onSubmit={(input) => {
              createM.mutate(input, { onSuccess: () => setShowCreate(false) });
            }}
            submitting={createM.isPending}
            error={createM.error instanceof Error ? createM.error.message : null}
          />
        )}

        {q.isLoading && (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <div className="space-y-2">
          {q.data?.codes.map((c) => (
            <div
              key={c.id}
              className="rounded-xl bg-card/60 p-4 ring-1 ring-border/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-secondary/60 px-2 py-1 font-mono text-sm font-bold">
                      {c.code}
                    </code>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        c.is_active
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.is_active ? "Actif" : "Inactif"}
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {c.access_tier}
                    </span>
                  </div>
                  {c.name && (
                    <p className="mt-1.5 text-sm font-medium">{c.name}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Utilisations : {c.uses_count}
                    {c.max_uses !== null ? ` / ${c.max_uses}` : " (illimité)"}
                    {c.expires_at && (
                      <> · expire le {new Date(c.expires_at).toLocaleDateString()}</>
                    )}
                    {c.duration_days && <> · durée : {c.duration_days} jours</>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      updateM.mutate({ id: c.id, isActive: !c.is_active })
                    }
                    aria-label={c.is_active ? "Désactiver" : "Activer"}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Supprimer ${c.code} ?`)) deleteM.mutate(c.id);
                    }}
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {q.data?.codes.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucun code pour l'instant.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateForm({
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  onClose: () => void;
  onSubmit: (input: {
    name?: string | null;
    code?: string | null;
    accessTier: Tier;
    maxUses?: number | null;
    expiresAt?: string | null;
    durationDays?: number | null;
  }) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [tier, setTier] = useState<Tier>("premium");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [durationDays, setDurationDays] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: name.trim() || null,
          code: code.trim() || null,
          accessTier: tier,
          maxUses: maxUses ? Number(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          durationDays: durationDays ? Number(durationDays) : null,
        });
      }}
      className="mb-4 space-y-3 rounded-xl bg-card/60 p-4 ring-1 ring-border/50"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Nom</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bêta testeurs"
            className="mt-1 w-full rounded-lg border border-input/50 bg-background/80 px-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Code (auto si vide)</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SWIPEITVIP"
            className="mt-1 w-full rounded-lg border border-input/50 bg-background/80 px-3 py-2 font-mono text-sm uppercase tracking-widest outline-none focus:border-primary/50"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Niveau d'accès</span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as Tier)}
            className="mt-1 w-full rounded-lg border border-input/50 bg-background/80 px-3 py-2 text-sm outline-none focus:border-primary/50"
          >
            <option value="premium">Premium</option>
            <option value="premium_plus">Premium+</option>
            <option value="beta">Beta tester</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Utilisations max</span>
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="illimité"
            className="mt-1 w-full rounded-lg border border-input/50 bg-background/80 px-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Expire le</span>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-input/50 bg-background/80 px-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Durée d'accès (jours)</span>
          <input
            type="number"
            min={1}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            placeholder="tant que le code est actif"
            className="mt-1 w-full rounded-lg border border-input/50 bg-background/80 px-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting} size="sm">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
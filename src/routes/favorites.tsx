import { createFileRoute } from "@tanstack/react-router";
import { Heart, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ItemTile } from "@/components/item-tile";
import { PageHeader, SwipeItShell } from "@/components/swipeit-shell";
import { PaywallGuard } from "@/components/paywall";
import { useSwipeIt } from "@/lib/swipeit-store";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favoris — SwipeIt" },
      { name: "description", content: "Retrouvez toutes vos decouvertes sauvegardees." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites, toggleFavorite } = useSwipeIt();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const shown = useMemo(
    () =>
      [...favorites.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))].sort((a, b) =>
        sort === "rating" ? b.rating - a.rating : sort === "alpha" ? a.title.localeCompare(b.title) : 0
      ),
    [favorites, query, sort]
  );

  return (
    <PaywallGuard>
      <SwipeItShell wide>
        <PageHeader
          eyebrow="Votre collection"
          title="Favoris"
          action={
            <span className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary">
              {favorites.length}
            </span>
          }
        />

        <main className="px-5 sm:px-8">
          {/* Search and sort */}
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] animate-slide-up">
            <label className="glass-subtle flex items-center gap-3 rounded-xl px-4 py-2.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher dans vos favoris"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-input/50 bg-secondary/50 px-4 py-2.5 text-sm outline-none"
            >
              <option value="recent">Plus recents</option>
              <option value="rating">Mieux notes</option>
              <option value="alpha">Alphabetique</option>
            </select>
          </div>

          {/* Grid or empty state */}
          {shown.length ? (
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              {shown.map((item, i) => (
                <div key={item.id} className="animate-rise" style={{ animationDelay: `${i * 0.05}s` }}>
                  <ItemTile item={item} onRemove={() => toggleFavorite(item)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[45vh] place-items-center text-center animate-fade-in">
              <div>
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary">
                  <Heart className="h-7 w-7 text-primary" />
                </span>
                <h2 className="mt-5 font-display text-xl font-bold">Votre collection vous attend</h2>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Swipez a droite sur une decouverte pour la retrouver ici.
                </p>
              </div>
            </div>
          )}
        </main>
      </SwipeItShell>
    </PaywallGuard>
  );
}

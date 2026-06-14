import { createFileRoute } from "@tanstack/react-router";
import { Heart, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ItemTile } from "@/components/item-tile";
import { PageHeader, SwipeItShell } from "@/components/swipeit-shell";
import { useSwipeIt } from "@/lib/swipeit-store";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Favoris — SwipeIt" }, { name: "description", content: "Retrouvez toutes vos découvertes sauvegardées." }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites, toggleFavorite } = useSwipeIt();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const shown = useMemo(() => favorites.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).toSorted((a, b) => sort === "rating" ? b.rating - a.rating : sort === "alpha" ? a.title.localeCompare(b.title) : 0), [favorites, query, sort]);
  return <SwipeItShell wide><PageHeader eyebrow="Votre collection" title="Favoris" action={<span className="rounded-full bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary">{favorites.length}</span>} />
    <main className="px-5 sm:px-8"><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><label className="glass flex items-center gap-3 rounded-2xl px-4 py-3"><Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher dans vos favoris" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-2xl border border-border bg-secondary px-4 py-3 text-sm outline-none"><option value="recent">Plus récents</option><option value="rating">Mieux notés</option><option value="alpha">Alphabétique</option></select></div>
      {shown.length ? <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">{shown.map((item) => <ItemTile key={item.id} item={item} onRemove={() => toggleFavorite(item)} />)}</div> : <div className="grid min-h-[45vh] place-items-center text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary"><Heart className="h-7 w-7 text-primary" /></span><h2 className="mt-5 font-display text-xl font-semibold">Votre collection vous attend</h2><p className="mt-2 max-w-xs text-sm text-muted-foreground">Swipez à droite sur une découverte pour la retrouver ici.</p></div></div>}
    </main>
  </SwipeItShell>;
}
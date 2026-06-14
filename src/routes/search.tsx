import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { ItemTile } from "@/components/item-tile";
import { PageHeader, SwipeItShell } from "@/components/swipeit-shell";
import { PaywallGuard } from "@/components/paywall";
import { categories, items } from "@/lib/swipeit-data";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Recherche — SwipeIt" }, { name: "description", content: "Recherchez instantanément parmi toutes les découvertes SwipeIt." }] }),
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return normalized ? items.filter((item) => `${item.title} ${item.category} ${item.tags.join(" ")}`.toLowerCase().includes(normalized)).slice(0, 12) : items.filter((_, index) => index % 11 === 0).slice(0, 10);
  }, [query]);
  return <PaywallGuard><SwipeItShell wide><PageHeader eyebrow="Explorer" title="Recherche" />
    <main className="px-5 sm:px-8">
      <label className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5"><Search className="h-5 w-5 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="Titre, tag ou catégorie…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label>
      {!query && <div className="mt-6"><p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Suggestions</p><div className="flex gap-2 overflow-x-auto pb-2">{categories.map((category) => <Link key={category.key} to="/swipe/$category" params={{ category: category.key }} className="whitespace-nowrap rounded-full bg-secondary px-4 py-2 text-xs font-semibold hover:bg-accent">{category.label}</Link>)}</div></div>}
      <p className="mb-4 mt-8 text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">{query ? `${filtered.length} résultats` : "Tendances du moment"}</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{filtered.map((item) => <ItemTile key={item.id} item={item} />)}</div>
    </main>
  </SwipeItShell></PaywallGuard>;
}
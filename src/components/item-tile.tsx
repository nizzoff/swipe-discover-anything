import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DiscoverItem } from "@/lib/swipeit-data";

export function ItemTile({ item, onRemove }: { item: DiscoverItem; onRemove?: () => void }) {
  return <article className="group relative overflow-hidden rounded-[1.5rem] bg-card ring-1 ring-border transition duration-300 hover:-translate-y-1 hover:ring-primary/40">
    <img src={item.image} alt={item.title} loading="lazy" width={1024} height={1024} className="aspect-[4/3] w-full object-cover opacity-80 grayscale-[20%] transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    <div className="absolute inset-x-4 bottom-4">
      <div className="mb-2 flex items-center justify-between gap-2"><span className="rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-bold uppercase backdrop-blur-lg">{item.category}</span><span className="flex items-center gap-1 text-xs"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{item.rating}</span></div>
      <h2 className="truncate text-lg font-semibold tracking-tight">{item.title}</h2>
    </div>
    {onRemove && <Button aria-label={`Retirer ${item.title}`} variant="glass" size="icon" className="absolute right-3 top-3 rounded-full" onClick={onRemove}><Heart className="fill-primary text-primary" /></Button>}
  </article>;
}
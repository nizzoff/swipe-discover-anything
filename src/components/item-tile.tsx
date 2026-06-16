import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DiscoverItem } from "@/lib/swipeit-data";

export function ItemTile({ item, onRemove }: { item: DiscoverItem; onRemove?: () => void }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-card ring-1 ring-border/50 transition-all duration-500 hover:-translate-y-2 hover:ring-primary/30 hover:shadow-lg">
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        width={1024}
        height={1024}
        className="aspect-[4/3] w-full object-cover opacity-75 grayscale-[25%] transition-all duration-700 group-hover:scale-110 group-hover:opacity-90 group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

      {/* Top badge */}
      {onRemove && (
        <Button
          aria-label={`Retirer ${item.title}`}
          variant="glass"
          size="icon"
          className="absolute right-3 top-3 h-9 w-9 rounded-lg opacity-0 transition-all duration-300 group-hover:opacity-100"
          onClick={onRemove}
        >
          <Heart className="h-4 w-4 fill-primary text-primary" />
        </Button>
      )}

      {/* Bottom content */}
      <div className="absolute inset-x-4 bottom-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="glass-subtle rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
            {item.category}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-background/60 px-2 py-1 text-xs font-bold backdrop-blur-lg">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {item.rating}
          </span>
        </div>
        <h2 className="truncate text-lg font-bold tracking-tight">{item.title}</h2>
      </div>
    </article>
  );
}

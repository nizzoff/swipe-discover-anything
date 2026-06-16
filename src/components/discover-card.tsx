import { Heart, MapPin, Star, X } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import type { DiscoverItem } from "@/lib/swipeit-data";

export function DiscoverCard({
  item,
  onDecision,
  countdown,
}: {
  item: DiscoverItem;
  onDecision: (liked: boolean) => void;
  countdown?: number;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [heart, setHeart] = useState(false);
  const start = useRef(0);

  function decide(liked: boolean) {
    if (liked) {
      setHeart(true);
      window.setTimeout(() => setHeart(false), 800);
    }
    setOffset(liked ? 700 : -700);
    window.setTimeout(() => onDecision(liked), 280);
    if (navigator.vibrate) navigator.vibrate(liked ? [15, 25, 15] : 12);
  }

  function onDown(event: PointerEvent<HTMLDivElement>) {
    start.current = event.clientX - offset;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onMove(event: PointerEvent<HTMLDivElement>) {
    if (dragging) setOffset(event.clientX - start.current);
  }

  function onUp() {
    setDragging(false);
    if (Math.abs(offset) > 100) decide(offset > 0);
    else setOffset(0);
  }

  return (
    <div className="relative mx-auto w-full max-w-[430px] select-none touch-pan-y">
      {/* Stacked cards effect */}
      <div className="absolute inset-x-2 top-2 h-full rounded-2xl bg-card/30 ring-1 ring-border/30" />
      <div className="absolute inset-x-4 top-4 h-full rounded-2xl bg-card/20 ring-1 ring-border/20" />

      {/* Main card */}
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{
          transform: `translateX(${offset}px) rotate(${offset / 25}deg)`,
          transition: dragging ? "none" : "transform 350ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="relative z-10 cursor-grab overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border/50 active:cursor-grabbing"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            width={1024}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

          {/* Top badges */}
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
            <span
              className={`rounded-lg px-3 py-1.5 text-xs font-bold backdrop-blur-xl ${
                item.sponsored
                  ? "bg-primary text-primary-foreground"
                  : "glass-subtle"
              }`}
            >
              {item.sponsored ? `Sponsorisé · ${countdown ?? 0}s` : item.category}
            </span>
            <span className="glass-subtle flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              {item.rating}
            </span>
          </div>

          {/* Bottom content */}
          <div className="absolute inset-x-4 bottom-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3 w-3" />
              Sélectionné pour vous
            </p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight">{item.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/70">
              {item.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-secondary/70 px-3 py-1.5 text-xs font-medium backdrop-blur-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Swipe indicators */}
          {offset > 50 && (
            <div className="absolute left-6 top-20 rotate-[-12deg] rounded-lg border-4 border-success bg-success/10 px-5 py-2.5 text-2xl font-black text-success">
              LIKE
            </div>
          )}
          {offset < -50 && (
            <div className="absolute right-6 top-20 rotate-[12deg] rounded-lg border-4 border-destructive bg-destructive/10 px-5 py-2.5 text-2xl font-black text-destructive">
              PASS
            </div>
          )}

          {/* Heart animation */}
          {heart && (
            <Heart className="animate-heart-pop absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 fill-primary text-primary drop-shadow-2xl" />
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="relative z-20 mt-8 flex justify-center gap-8">
        <Button
          aria-label="Passer"
          variant="outline"
          size="orb"
          onClick={() => decide(false)}
          disabled={item.sponsored && (countdown ?? 0) > 0}
          className="bg-destructive/5 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-7 w-7" />
        </Button>
        <Button
          aria-label={item.sponsored ? "Découvrir" : "Aimer"}
          variant="premium"
          size="orb"
          onClick={() => decide(true)}
          disabled={item.sponsored && (countdown ?? 0) > 0}
        >
          <Heart className="h-7 w-7 fill-primary-foreground" />
        </Button>
      </div>
    </div>
  );
}

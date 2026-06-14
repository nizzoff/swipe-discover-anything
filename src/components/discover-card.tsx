import { Heart, MapPin, Star, X } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import type { DiscoverItem } from "@/lib/swipeit-data";

export function DiscoverCard({ item, onDecision, countdown }: { item: DiscoverItem; onDecision: (liked: boolean) => void; countdown?: number }) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [heart, setHeart] = useState(false);
  const start = useRef(0);

  function decide(liked: boolean) {
    if (liked) { setHeart(true); window.setTimeout(() => setHeart(false), 700); }
    setOffset(liked ? 700 : -700);
    window.setTimeout(() => onDecision(liked), 240);
    if (navigator.vibrate) navigator.vibrate(liked ? [15, 25, 15] : 12);
  }

  function onDown(event: PointerEvent<HTMLDivElement>) {
    start.current = event.clientX - offset; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onMove(event: PointerEvent<HTMLDivElement>) { if (dragging) setOffset(event.clientX - start.current); }
  function onUp() { setDragging(false); if (Math.abs(offset) > 90) decide(offset > 0); else setOffset(0); }

  return <div className="relative mx-auto w-full max-w-[430px] select-none touch-pan-y">
    <div className="absolute inset-x-3 top-3 h-full rounded-[1.75rem] bg-card/45 ring-1 ring-primary/15" />
    <div className="absolute inset-x-6 top-6 h-full rounded-[1.75rem] bg-card/25 ring-1 ring-border" />
    <div
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      style={{ transform: `translateX(${offset}px) rotate(${offset / 22}deg)`, transition: dragging ? "none" : "transform 300ms cubic-bezier(.2,.8,.2,1)" }}
      className="relative z-10 cursor-grab overflow-hidden rounded-[1.75rem] bg-card shadow-2xl ring-1 ring-border active:cursor-grabbing"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img src={item.image} alt={item.title} width={1024} height={1024} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-xl ${item.sponsored ? "bg-primary text-primary-foreground" : "bg-background/55 text-foreground"}`}>{item.sponsored ? `Sponsorisé · ${countdown ?? 0}s` : item.category}</span>
          <span className="flex items-center gap-1 rounded-full bg-background/55 px-3 py-1.5 text-xs font-bold backdrop-blur-xl"><Star className="h-3.5 w-3.5 fill-primary text-primary" /> {item.rating}</span>
        </div>
        <div className="absolute inset-x-5 bottom-5">
          <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Sélectionné pour vous</p>
          <h2 className="text-3xl font-semibold leading-tight tracking-[-.045em]">{item.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/75">{item.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-secondary/80 px-3 py-1.5 text-xs font-medium backdrop-blur-lg">{tag}</span>)}</div>
        </div>
        {offset > 35 && <div className="absolute left-6 top-24 rotate-[-10deg] rounded-xl border-4 border-success px-4 py-2 text-2xl font-black text-success">LIKE</div>}
        {offset < -35 && <div className="absolute right-6 top-24 rotate-[10deg] rounded-xl border-4 border-destructive px-4 py-2 text-2xl font-black text-destructive">PASS</div>}
        {heart && <Heart className="animate-heart-pop absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 fill-primary text-primary drop-shadow-2xl" />}
      </div>
    </div>
    <div className="relative z-20 mt-8 flex justify-center gap-6">
      <Button aria-label="Passer" variant="glass" size="orb" onClick={() => decide(false)} disabled={item.sponsored && (countdown ?? 0) > 0}><X className="h-7 w-7 text-destructive" /></Button>
      <Button aria-label={item.sponsored ? "Découvrir" : "Aimer"} variant="premium" size="orb" onClick={() => decide(true)} disabled={item.sponsored && (countdown ?? 0) > 0}><Heart className="h-7 w-7 fill-primary-foreground text-primary-foreground" /></Button>
    </div>
  </div>;
}
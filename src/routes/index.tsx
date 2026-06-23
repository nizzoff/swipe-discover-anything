import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Bell } from "lucide-react";
import { SwipeItShell } from "@/components/swipeit-shell";
import { PaywallGuard } from "@/components/paywall";
import { categories } from "@/lib/swipeit-data";
import { useSwipeIt } from "@/lib/swipeit-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SwipeIt — Découvrez votre prochaine obsession" },
      { name: "description", content: "Choisissez une catégorie et swipez pour découvrir musique, films, restaurants et expériences." },
      { property: "og:title", content: "SwipeIt — Discover anything" },
      { property: "og:description", content: "La découverte universelle, un swipe à la fois." },
    ],
  }),
  component: Index,
});

const moods = [
  { key: "joyeux", emoji: "😄", label: "Joyeux", gradient: "radial-gradient(120% 80% at 50% 0%, rgba(255,193,7,0.35), transparent 60%), radial-gradient(100% 60% at 100% 100%, rgba(255,87,34,0.25), transparent 60%)" },
  { key: "calme", emoji: "😌", label: "Calme", gradient: "radial-gradient(120% 80% at 50% 0%, rgba(96,165,250,0.30), transparent 60%), radial-gradient(100% 60% at 0% 100%, rgba(167,139,250,0.25), transparent 60%)" },
  { key: "reveur", emoji: "🥱", label: "Rêveur", gradient: "radial-gradient(120% 80% at 50% 0%, rgba(167,139,250,0.30), transparent 60%), radial-gradient(100% 60% at 100% 100%, rgba(236,72,153,0.20), transparent 60%)" },
  { key: "intense", emoji: "😤", label: "Intense", gradient: "radial-gradient(120% 80% at 50% 0%, rgba(239,68,68,0.35), transparent 60%), radial-gradient(100% 60% at 100% 100%, rgba(124,58,237,0.25), transparent 60%)" },
  { key: "curieux", emoji: "🤩", label: "Curieux", gradient: "radial-gradient(120% 80% at 50% 0%, rgba(34,197,94,0.30), transparent 60%), radial-gradient(100% 60% at 0% 100%, rgba(14,165,233,0.25), transparent 60%)" },
] as const;

function Index() {
  const [mood, setMood] = useState<(typeof moods)[number]["key"]>("joyeux");
  const { favorites, swipes } = useSwipeIt();
  const current = moods.find((m) => m.key === mood)!;
  const goal = 20;
  const todaySwipes = swipes % goal;
  const pct = Math.round((todaySwipes / goal) * 100);

  // Bento layout: 7 categories arranged like the reference (mix of large + small tiles)
  const sizes = [
    "col-span-2 row-span-1", // music wide
    "col-span-1 row-span-2", // movies tall
    "col-span-1 row-span-1", // food
    "col-span-1 row-span-1", // activities
    "col-span-2 row-span-1", // books wide
    "col-span-1 row-span-1", // games
    "col-span-1 row-span-1", // travel
  ];

  return (
    <PaywallGuard>
      <div
        className="fixed inset-0 -z-10 transition-all duration-700 ease-out"
        style={{ backgroundImage: current.gradient }}
      />
      <SwipeItShell wide>
        {/* Top bar */}
        <header className="px-5 pt-10 sm:px-8 sm:pt-14">
          <div className="flex items-center justify-between gap-3 animate-slide-up">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/20 font-display text-lg font-bold text-primary ring-2 ring-primary/30">
                B
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Bon retour,
                </p>
                <p className="truncate font-display text-base font-bold tracking-tight">
                  Baptiste
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                aria-label="Notifications"
                className="glass-subtle grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
              </button>
              <Link
                to="/search"
                aria-label="Rechercher"
                className="glass-subtle grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <main className="px-5 pt-6 sm:px-8">
          {/* Daily Score hero card */}
          <div
            className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-[var(--shadow-glow)] animate-slide-up"
            style={{ animationDelay: "0.05s" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-3xl font-black tracking-tight">
                  Score du jour
                </p>
                <p className="mt-1 text-sm font-medium opacity-80">
                  {todaySwipes}/{goal} découvertes
                </p>
              </div>
              <div className="relative grid h-20 w-20 shrink-0 place-items-center">
                <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none" stroke="currentColor"
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${pct}, 100`}
                  />
                </svg>
                <span className="relative font-display text-xl font-black">{pct}%</span>
              </div>
            </div>
          </div>

          {/* Mood selector */}
          <div className="mt-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <p className="text-center text-sm font-medium text-muted-foreground">
              Choisis ton humeur du moment
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              {moods.map((m) => {
                const active = m.key === mood;
                return (
                  <button
                    key={m.key}
                    onClick={() => setMood(m.key)}
                    aria-label={m.label}
                    aria-pressed={active}
                    className={`grid h-12 w-12 place-items-center rounded-full text-2xl transition-all duration-300 sm:h-14 sm:w-14 ${
                      active
                        ? "bg-primary scale-110 shadow-[var(--shadow-glow)] ring-2 ring-primary-foreground/20"
                        : "bg-secondary/60 hover:bg-secondary opacity-60 hover:opacity-100"
                    }`}
                  >
                    <span>{m.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bento categories */}
          <div className="mt-6 grid auto-rows-[110px] grid-cols-3 gap-3 sm:auto-rows-[140px]">
            {categories.map((category, index) => (
              <Link
                key={category.key}
                to="/swipe/$category"
                params={{ category: category.key }}
                className={`group relative overflow-hidden rounded-2xl ring-1 ring-border/40 transition-all duration-300 hover:ring-primary/50 animate-rise ${sizes[index]}`}
                style={{ animationDelay: `${0.15 + index * 0.04}s` }}
              >
                <img
                  src={category.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-between p-3">
                  <span className="self-end grid h-8 w-8 place-items-center rounded-full bg-white/15 backdrop-blur-md text-base">
                    {category.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70">
                      {category.eyebrow}
                    </p>
                    <h3 className="mt-0.5 truncate font-display text-base font-bold tracking-tight text-white sm:text-lg">
                      {category.label}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {favorites.length > 0 && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              {favorites.length} favoris · {swipes} swipes
            </p>
          )}
        </main>
      </SwipeItShell>
    </PaywallGuard>
  );
}

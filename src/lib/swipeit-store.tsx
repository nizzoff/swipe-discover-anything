import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { items, type DiscoverItem } from "./swipeit-data";

interface StoreValue {
  favorites: DiscoverItem[];
  swipes: number;
  minutes: number;
  toggleFavorite: (item: DiscoverItem) => void;
  registerSwipe: (item: DiscoverItem, liked: boolean) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function SwipeItProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [swipes, setSwipes] = useState(284);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("swipeit-state");
      if (saved) {
        const state = JSON.parse(saved) as { favoriteIds?: string[]; swipes?: number };
        setFavoriteIds(state.favoriteIds ?? []);
        setSwipes(state.swipes ?? 284);
      }
    } catch { /* demo state falls back gracefully */ }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("swipeit-state", JSON.stringify({ favoriteIds, swipes }));
  }, [favoriteIds, swipes]);

  const value = useMemo<StoreValue>(() => ({
    favorites: items.filter((item) => favoriteIds.includes(item.id)),
    swipes,
    minutes: 47,
    toggleFavorite: (item) => setFavoriteIds((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [item.id, ...ids]),
    registerSwipe: (item, liked) => {
      setSwipes((count) => count + 1);
      if (liked) setFavoriteIds((ids) => ids.includes(item.id) ? ids : [item.id, ...ids]);
    },
  }), [favoriteIds, swipes]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useSwipeIt() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useSwipeIt must be used within SwipeItProvider");
  return context;
}
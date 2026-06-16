import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "ocean" | "sunset" | "forest" | "midnight";
export type ThemeOption = { id: Theme; name: string; color: string };

export const themes: ThemeOption[] = [
  { id: "dark", name: "Default", color: "oklch(0.78 0.16 210)" },
  { id: "ocean", name: "Ocean", color: "oklch(0.65 0.18 220)" },
  { id: "sunset", name: "Sunset", color: "oklch(0.7 0.2 25)" },
  { id: "forest", name: "Forest", color: "oklch(0.7 0.15 150)" },
  { id: "midnight", name: "Midnight", color: "oklch(0.55 0.12 270)" },
];

interface ThemeValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("swipeit-theme");
    return (saved as Theme) || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("swipeit-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

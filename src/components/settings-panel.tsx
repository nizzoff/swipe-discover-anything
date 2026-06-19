import { Bell, Check, Globe2, Moon, Shield, LogOut, LogIn } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Switch } from "@/components/ui/switch";
import { themes, useTheme, type Theme } from "@/lib/theme-provider";
import { isAdmin } from "@/lib/promo.functions";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const languages = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "es", name: "Espanol" },
];

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const checkAdmin = useServerFn(isAdmin);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(Boolean(s)));
    return () => sub.subscription.unsubscribe();
  }, []);
  const adminQ = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => checkAdmin(),
    enabled: authed,
    retry: false,
  });

  return (
    <div className="space-y-4">
      {/* Theme selector */}
      <section className="overflow-hidden rounded-xl bg-card/60 ring-1 ring-border/50">
        <div className="flex items-center gap-3 border-b border-border/50 p-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Moon className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">Theme</span>
        </div>
        <div className="grid grid-cols-4 gap-2 p-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`group relative flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all ${
                theme === t.id ? "ring-1 ring-primary/50" : "hover:bg-secondary/50"
              }`}
            >
              <div
                className="h-6 w-6 rounded-full ring-2 ring-white/10 transition group-hover:ring-white/20"
                style={{ background: t.color }}
              />
              <span className="text-[10px] font-medium text-muted-foreground">{t.name}</span>
              {theme === t.id && (
                <div className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Other settings */}
      <section className="overflow-hidden rounded-xl bg-card/60 ring-1 ring-border/50">
        <div className="flex items-center justify-between border-b border-border/50 p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">Notifications</span>
          </div>
          <Switch defaultChecked aria-label="Notifications" />
        </div>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Globe2 className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">Langue</span>
          </div>
          <select
            defaultValue="fr"
            className="rounded-lg border border-input/50 bg-secondary/50 px-3 py-1.5 text-xs font-medium outline-none focus:border-primary/50"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Account */}
      <section className="overflow-hidden rounded-xl bg-card/60 ring-1 ring-border/50">
        {authed ? (
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex w-full items-center gap-3 p-3 text-sm font-semibold hover:bg-secondary/50"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <LogOut className="h-4 w-4" />
            </span>
            Se déconnecter
          </button>
        ) : (
          <Link
            to="/auth"
            className="flex w-full items-center gap-3 p-3 text-sm font-semibold hover:bg-secondary/50"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <LogIn className="h-4 w-4" />
            </span>
            Se connecter
          </Link>
        )}
        {adminQ.data?.isAdmin && (
          <Link
            to="/admin/promo-codes"
            className="flex w-full items-center gap-3 border-t border-border/50 p-3 text-sm font-semibold hover:bg-secondary/50"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Shield className="h-4 w-4" />
            </span>
            Gérer les codes promo
          </Link>
        )}
      </section>
    </div>
  );
}

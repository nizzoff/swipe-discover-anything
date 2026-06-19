const FALLBACK_SUPABASE_URL = "https://aohukpcfhjnmwtcesjdd.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_WiLsFN91Xr5QqzJZPhWrbw_SCedCVFA";

function getProcessEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env?.[name];
}

export function getSupabaseUrl(): string {
  return (
    import.meta.env.VITE_SUPABASE_URL ||
    getProcessEnv("VITE_SUPABASE_URL") ||
    getProcessEnv("SUPABASE_URL") ||
    FALLBACK_SUPABASE_URL
  );
}

export function getSupabasePublishableKey(): string {
  return (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    getProcessEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    getProcessEnv("SUPABASE_PUBLISHABLE_KEY") ||
    FALLBACK_SUPABASE_PUBLISHABLE_KEY
  );
}
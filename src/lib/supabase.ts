import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getSupabasePublishableKey, getSupabaseUrl } from "./supabase-config";

let client: ReturnType<typeof createClient<Database>> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_, prop, receiver) {
    if (!client) {
      client = createClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
        auth: {
          storage: typeof window !== "undefined" ? window.localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return Reflect.get(client, prop, receiver);
  },
});

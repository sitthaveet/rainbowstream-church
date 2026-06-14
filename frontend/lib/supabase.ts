import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client shared by every API route handler (via lib/db.ts).
 *
 * The browser never talks to Supabase directly — all DB access is proxied
 * through the route handlers, which enforce authorization themselves
 * (see lib/auth.ts). RLS is disabled on the tables, so the anon/publishable key
 * is sufficient; there is no per-row policy to satisfy.
 *
 * The real client is created lazily on first use so that importing this module
 * is side-effect-free (the env vars need not be present at build time, only at
 * request time). This module is server-only: never import it (or lib/db.ts)
 * from a client component.
 */

// Cache on globalThis so Next.js dev HMR does not open duplicate clients.
const globalForSb = globalThis as unknown as { __rscSupabase?: SupabaseClient };

function getClient(): SupabaseClient {
  if (globalForSb.__rscSupabase) return globalForSb.__rscSupabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLIC_API_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_PUBLIC_API_KEY environment variables.",
    );
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Force fresh reads: Next.js caches `fetch` by default, which would serve
    // stale read-after-write data inside the long-lived server process.
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });

  globalForSb.__rscSupabase = client;
  return client;
}

/**
 * A lazy proxy over the Supabase client. Property access (e.g. `supabase.from`,
 * `supabase.rpc`) instantiates the real client on first use; methods are bound
 * to it so `this` is correct.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

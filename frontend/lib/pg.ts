import { Pool, types, type QueryResult, type QueryResultRow } from "pg";
import { attachDatabasePool } from "@vercel/functions";

/**
 * Server-side Postgres (Neon) pool shared by every API route handler (via
 * lib/db.ts).
 *
 * The browser never talks to the database directly — all DB access is proxied
 * through the route handlers, which enforce authorization themselves
 * (see lib/auth.ts). The connection string (NEON_CONNECTION) is server-only.
 *
 * The pool is created lazily on first query so that importing this module is
 * side-effect-free (the env var need not be present at build time, only at
 * request time). This module is server-only: never import it (or lib/db.ts)
 * from a client component.
 */

// Return `date` and `timestamptz` as strings, matching the domain types
// (lib/types.ts) and what PostgREST used to return. Without this, node-postgres
// parses both into JS Date objects — and `date` in the *local* timezone, which
// can shift a birthdate by a day.
types.setTypeParser(types.builtins.DATE, (v) => v);
types.setTypeParser(types.builtins.TIMESTAMPTZ, (v) =>
  new Date(v).toISOString(),
);

// Cache on globalThis so Next.js dev HMR does not open duplicate pools.
const globalForPg = globalThis as unknown as { __rscPool?: Pool };

function getPool(): Pool {
  if (globalForPg.__rscPool) return globalForPg.__rscPool;

  const connectionString = process.env.NEON_CONNECTION;
  if (!connectionString) {
    throw new Error("Missing NEON_CONNECTION environment variable.");
  }

  const pool = new Pool({ connectionString, max: 5 });
  // On Vercel (Fluid compute) the runtime drains idle connections before an
  // instance suspends; everywhere else this is a no-op.
  attachDatabasePool(pool);

  globalForPg.__rscPool = pool;
  return pool;
}

/** Runs one parameterized statement against the shared pool. */
export function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<R>> {
  return getPool().query<R>(text, params as never[]);
}

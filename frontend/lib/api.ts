import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** An error with an intended HTTP status. Thrown anywhere, caught by `handleRoute`. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string = "error",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Standard JSON error response: `{ error: { code, message } }`. */
export function jsonError(status: number, message: string, code = "error") {
  return NextResponse.json({ error: { code, message } }, { status });
}

/**
 * Detects a Postgres unique-constraint violation surfaced through the
 * Data Connect Web SDK.
 *
 * SPIKE NOTE (see plan issue #2): the Web SDK does not expose a clean
 * SQLSTATE 23505 — it throws a `DataConnectError` whose message carries the
 * Postgres text. This matcher is written defensively against the usual
 * wording. Before relying on the 409 paths in production, trigger a duplicate
 * check-in and a duplicate email against the emulator, log the raw error, and
 * confirm the substrings below (and the constraint names) match reality.
 *
 * @param constraintHint substring of the constraint name to disambiguate
 *   which unique index failed, e.g. "line_id", "email", "event_id".
 */
export function isUniqueViolation(
  err: unknown,
  constraintHint?: string,
): boolean {
  const msg = errorText(err).toLowerCase();
  const looksUnique =
    msg.includes("duplicate key") ||
    msg.includes("unique constraint") ||
    msg.includes("23505") ||
    msg.includes("already exists");
  if (!looksUnique) return false;
  return constraintHint ? msg.includes(constraintHint.toLowerCase()) : true;
}

/**
 * Flattens an error into one searchable string, collecting `message`/`code`
 * from the error and any nested GraphQL / Data Connect shapes (`errors[]`,
 * `response`, `cause`, `extensions`). The unique-violation text can surface in
 * any of these depending on SDK/transport, so all are searched rather than
 * relying on `err.message` alone.
 */
function errorText(err: unknown): string {
  const parts: string[] = [];
  const seen = new Set<unknown>();
  const visit = (e: unknown, depth: number): void => {
    if (e == null || depth > 5 || seen.has(e)) return;
    if (typeof e === "string") {
      parts.push(e);
      return;
    }
    if (typeof e !== "object") return;
    seen.add(e);
    const o = e as Record<string, unknown>;
    if (typeof o.message === "string") parts.push(o.message);
    if (typeof o.code === "string") parts.push(o.code);
    if (Array.isArray(o.errors)) o.errors.forEach((x) => visit(x, depth + 1));
    visit(o.response, depth + 1);
    visit(o.cause, depth + 1);
    visit(o.extensions, depth + 1);
  };
  visit(err, 0);
  return parts.length ? parts.join(" ") : String(err);
}

function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) return jsonError(err.status, err.message, err.code);
  if (err instanceof ZodError) {
    const detail = err.issues
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join("; ");
    return jsonError(400, detail, "validation_error");
  }
  if (err instanceof SyntaxError) {
    return jsonError(400, "Malformed JSON body", "bad_request");
  }
  if (isUniqueViolation(err)) {
    return jsonError(409, "Resource already exists", "conflict");
  }
  console.error("Unhandled route error:", err);
  return jsonError(500, "Internal server error", "internal_error");
}

/**
 * Wraps a route handler so thrown `ApiError`/`ZodError`/unique-violations
 * become proper JSON responses. Generic over the handler arguments so the
 * wrapped function keeps the exact signature Next.js type-checks against.
 */
export function handleRoute<T extends unknown[]>(
  fn: (...args: T) => Promise<NextResponse>,
): (...args: T) => Promise<NextResponse> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

/** Parses + validates a JSON body. Bad JSON → 400; schema failure → ZodError. */
export async function parseBody<T>(
  req: Request,
  schema: { parse: (v: unknown) => T },
): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError(400, "Malformed JSON body", "bad_request");
  }
  return schema.parse(raw);
}

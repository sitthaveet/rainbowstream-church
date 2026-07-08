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
 * Detects a Postgres unique-constraint violation.
 *
 * node-postgres exposes a structured error with `code === "23505"` and the
 * constraint name in `constraint`/`message`/`detail` (e.g. `users_email_key`,
 * `users_line_uid_key`, `checkins_event_id_user_id_key`). We key off the code
 * first, with a defensive text fallback for errors that arrive less structured.
 *
 * @param constraintHint substring of the constraint name to disambiguate
 *   which unique index failed, e.g. "line_uid", "email", "event_id".
 */
export function isUniqueViolation(
  err: unknown,
  constraintHint?: string,
): boolean {
  const code = (err as { code?: unknown } | null)?.code;
  const msg = errorText(err).toLowerCase();
  const looksUnique =
    code === "23505" ||
    msg.includes("duplicate key") ||
    msg.includes("unique constraint") ||
    msg.includes("23505") ||
    msg.includes("already exists");
  if (!looksUnique) return false;
  return constraintHint ? msg.includes(constraintHint.toLowerCase()) : true;
}

/**
 * Flattens an error into one searchable string, collecting `message`/`code`/
 * `details`/`detail`/`hint`/`constraint` from the error and any nested wrapper
 * (`response`, `cause`). A Postgres unique violation spreads the constraint
 * name and detail across these fields, so all are searched rather than relying
 * on `err.message` alone.
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
    if (typeof o.details === "string") parts.push(o.details);
    if (typeof o.detail === "string") parts.push(o.detail);
    if (typeof o.hint === "string") parts.push(o.hint);
    if (typeof o.constraint === "string") parts.push(o.constraint);
    visit(o.response, depth + 1);
    visit(o.cause, depth + 1);
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

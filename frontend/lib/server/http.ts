/**
 * http.ts — Helpers shared by the API route handlers (app/api/**).
 */
import { ensureSchema } from "./migrate";

export function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

/** Parses a JSON body; returns null when it is missing or malformed. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- request bodies are validated field by field
export async function readJson(req: Request): Promise<Record<string, any> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}

/**
 * Wraps a route handler: makes sure the database schema exists, then turns any
 * unexpected error into a JSON 500 with the given French message.
 */
export function api<C>(
  handler: (req: Request, ctx: C) => Promise<Response>,
  errorMessage = "Erreur interne du serveur."
) {
  return async (req: Request, ctx: C): Promise<Response> => {
    try {
      await ensureSchema();
      return await handler(req, ctx);
    } catch (err) {
      console.error(`${req.method} ${new URL(req.url).pathname}:`, err);
      return jsonError(errorMessage, 500);
    }
  };
}

/** Route context for handlers under a [id] segment. */
export type IdContext = { params: Promise<{ id: string }> };

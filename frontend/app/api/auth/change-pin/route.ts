import { api, jsonError, readJson } from "@/lib/server/http";
import { getAdminPin, requireAdmin, safeEqual, setAdminPin } from "@/lib/server/auth";

/**
 * POST /api/auth/change-pin
 * Body: { currentPin: string, newPin: string }
 * Requires a valid Bearer token (the admin must be logged in).
 */
export const POST = api(async (req: Request) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = await readJson(req);
  const { currentPin, newPin } = body ?? {};

  if (!currentPin || !newPin) {
    return jsonError("Code actuel et nouveau code requis.", 400);
  }

  const trimmedCurrent = String(currentPin).trim();
  const trimmedNew = String(newPin).trim();

  if (!safeEqual(trimmedCurrent, await getAdminPin())) {
    return jsonError("Code actuel incorrect.", 401);
  }

  // Validate new PIN (6–64 chars, no whitespace)
  if (!/^\S{6,64}$/.test(trimmedNew)) {
    return jsonError("Le nouveau code doit contenir entre 6 et 64 caractères, sans espace.", 400);
  }

  await setAdminPin(trimmedNew);

  return Response.json({
    success: true,
    message: "Code PIN mis à jour. Reconnectez-vous avec votre nouveau code.",
  });
}, "Erreur lors du changement de code.");

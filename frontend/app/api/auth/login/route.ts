import { api, jsonError, readJson } from "@/lib/server/http";
import { clearFailures, clientIp, getAdminPin, getAdminToken, isLocked, recordFailure, safeEqual } from "@/lib/server/auth";

export const POST = api(async (req: Request) => {
  const ip = clientIp(req);
  if (isLocked(ip)) {
    return jsonError("Trop de tentatives échouées. Réessayez dans 15 minutes.", 429);
  }

  const body = await readJson(req);
  const code = body?.code;

  if (!code || !safeEqual(String(code).trim(), await getAdminPin())) {
    recordFailure(ip);
    return jsonError("Code d'accès administrateur incorrect.", 401);
  }

  clearFailures(ip);
  return Response.json({
    success: true,
    message: "Authentification réussie.",
    token: await getAdminToken(),
  });
}, "Erreur lors de l'authentification.");

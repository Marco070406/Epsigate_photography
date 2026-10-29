import { api, jsonError, readJson } from "@/lib/server/http";
import { clientIp, createAdminToken, getAdminPin, safeEqual } from "@/lib/server/auth";
import { attempts, hit, reset } from "@/lib/server/rateLimit";

// 5 wrong codes per IP lock the login for 15 minutes
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 15 * 60;

export const POST = api(async (req: Request) => {
  const key = `login:${clientIp(req)}`;
  if ((await attempts(key)) >= MAX_ATTEMPTS) {
    return jsonError("Trop de tentatives échouées. Réessayez dans 15 minutes.", 429);
  }

  const body = await readJson(req);
  const code = body?.code;

  if (!code || !safeEqual(String(code).trim(), await getAdminPin())) {
    await hit(key, LOCK_SECONDS);
    return jsonError("Code d'accès administrateur incorrect.", 401);
  }

  await reset(key);
  return Response.json({
    success: true,
    message: "Authentification réussie.",
    token: await createAdminToken(),
  });
}, "Erreur lors de l'authentification.");

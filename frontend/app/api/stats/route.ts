import { api } from "@/lib/server/http";
import { cachedStats } from "@/lib/server/cache";

export const GET = api(async () => {
  return Response.json({ success: true, data: await cachedStats() });
}, "Impossible de récupérer les statistiques.");

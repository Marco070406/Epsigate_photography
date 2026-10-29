import { api } from "@/lib/server/http";
import { getSiteStats } from "@/lib/server/db";

export const GET = api(async () => {
  return Response.json({ success: true, data: await getSiteStats() });
}, "Impossible de récupérer les statistiques.");

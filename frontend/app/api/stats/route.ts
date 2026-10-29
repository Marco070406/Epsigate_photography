import { api, publicJson } from "@/lib/server/http";
import { cachedStats } from "@/lib/server/cache";

export const GET = api(async (req: Request) => {
  return publicJson(req, await cachedStats());
}, "Impossible de récupérer les statistiques.");

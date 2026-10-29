import { api } from "@/lib/server/http";
import { getMessages } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export const GET = api(async (req: Request) => {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return Response.json({ success: true, data: await getMessages() });
}, "Impossible de récupérer les messages.");

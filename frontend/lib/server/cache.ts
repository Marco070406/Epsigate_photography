/**
 * cache.ts — Public reads served from Next's data cache instead of the database.
 * Every admin write calls invalidate() so visitors see changes immediately.
 */
import { unstable_cache, revalidateTag } from "next/cache";
import { getPortfolio, getServices, getTeam, getSiteSettings, getSiteStats } from "./db";
import { CONTENT_VERSION } from "./content";

export type CacheTag = "portfolio" | "services" | "team" | "settings" | "stats";

// Safety net: entries are refreshed at least once a day even without a write
const DAY = 24 * 60 * 60;

// The data cache outlives deployments: keying it on the migration version makes
// a deployment that updates the content skip entries cached before it
const v = CONTENT_VERSION;

export const cachedPortfolio = unstable_cache(getPortfolio, ["portfolio", v], { tags: ["portfolio"], revalidate: DAY });
export const cachedServices = unstable_cache(getServices, ["services", v], { tags: ["services"], revalidate: DAY });
export const cachedTeam = unstable_cache(getTeam, ["team", v], { tags: ["team"], revalidate: DAY });
export const cachedSettings = unstable_cache(getSiteSettings, ["settings", v], { tags: ["settings"], revalidate: DAY });
export const cachedStats = unstable_cache(getSiteStats, ["stats", v], { tags: ["stats"], revalidate: DAY });

/** Expires a cached read right away (the next request fetches fresh data). */
export function invalidate(...tags: CacheTag[]): void {
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
}

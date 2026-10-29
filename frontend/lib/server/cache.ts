/**
 * cache.ts — Public reads served from Next's data cache instead of the database.
 * Every admin write calls invalidate() so visitors see changes immediately.
 */
import { unstable_cache, revalidateTag } from "next/cache";
import { getPortfolio, getServices, getTeam, getSiteSettings, getSiteStats } from "./db";

export type CacheTag = "portfolio" | "services" | "team" | "settings" | "stats";

// Safety net: entries are refreshed at least once a day even without a write
const DAY = 24 * 60 * 60;

export const cachedPortfolio = unstable_cache(getPortfolio, ["portfolio"], { tags: ["portfolio"], revalidate: DAY });
export const cachedServices = unstable_cache(getServices, ["services"], { tags: ["services"], revalidate: DAY });
export const cachedTeam = unstable_cache(getTeam, ["team"], { tags: ["team"], revalidate: DAY });
export const cachedSettings = unstable_cache(getSiteSettings, ["settings"], { tags: ["settings"], revalidate: DAY });
export const cachedStats = unstable_cache(getSiteStats, ["stats"], { tags: ["stats"], revalidate: DAY });

/** Expires a cached read right away (the next request fetches fresh data). */
export function invalidate(...tags: CacheTag[]): void {
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
}

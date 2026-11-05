// Collects RSS articles, stores them and publishes (or republishes) the edition for a given day.
import { and, desc, gte, lt, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { editions, feedItems } from "../db/schema.js";
import { collectFeeds } from "./feeds.js";
import { buildEdition, editionNumber, mexicoNow, type ArticleRow, type EditionData, type WeekEntry } from "./edition.js";

export async function storeArticles(): Promise<{ ok: string[]; failed: string[]; stored: number }> {
  const { items, ok, failed } = await collectFeeds();
  for (let i = 0; i < items.length; i += 100) {
    await db
      .insert(feedItems)
      .values(items.slice(i, i + 100))
      .onConflictDoUpdate({
        target: feedItems.link,
        set: {
          summary: sql`excluded.summary`,
          image: sql`CASE WHEN excluded.image <> '' THEN excluded.image ELSE ${feedItems.image} END`,
        },
      });
  }
  return { ok, failed, stored: items.length };
}

async function storedArticles(beforeIso: string): Promise<ArticleRow[]> {
  const before = new Date(beforeIso);
  const since = new Date(before.getTime() - 21 * 864e5);
  const cols = {
    link: feedItems.link, source: feedItems.source, topic: feedItems.topic, title: feedItems.title,
    summary: feedItems.summary, image: feedItems.image, publishedAt: feedItems.publishedAt,
  };
  const recent = await db.select(cols).from(feedItems)
    .where(and(gte(feedItems.publishedAt, since), lt(feedItems.publishedAt, before)))
    .orderBy(desc(feedItems.publishedAt)).limit(400);
  if (recent.length >= 5) return recent;
  // Fall back to the newest stored articles of any age so the cover is never empty.
  return db.select(cols).from(feedItems).where(lt(feedItems.publishedAt, before)).orderBy(desc(feedItems.publishedAt)).limit(200);
}

export async function publishEdition(date = mexicoNow().date, opts: { fetch?: boolean } = {}): Promise<EditionData | null> {
  let sources = { ok: [] as string[], failed: [] as string[] };
  if (opts.fetch !== false) {
    try {
      const r = await storeArticles();
      sources = { ok: r.ok, failed: r.failed };
    } catch (e) {
      console.error("RSS collection failed, using stored articles", e);
    }
  }

  const now = Date.now();
  // Only use articles published up to the end of that day (Mexico City is UTC-6).
  const endOfDay = new Date(Date.parse(date + "T00:00:00Z") + 30 * 3600e3);
  const cutoff = new Date(Math.min(now, endOfDay.getTime())).toISOString();
  const articles = await storedArticles(cutoff);

  const previous = await db.select().from(editions).where(lt(editions.date, date)).orderBy(desc(editions.date)).limit(6);
  const recentLinks = new Set<string>();
  const week: WeekEntry[] = [];
  for (const p of previous) {
    const d = p.data as EditionData;
    if (d?.featured) recentLinks.add(d.featured.link);
    d?.stories?.forEach((s) => recentLinks.add(s.link));
    if (editionNumber(date) - p.number <= 6) {
      week.push({ date: p.date, number: p.number, theme: d.theme.name, headline: p.headline, featured: d.featured && { title: d.featured.title, link: d.featured.link, source: d.featured.source } });
    }
  }

  const data = buildEdition({ date, articles, recentLinks, week, sources, now: Math.min(now, endOfDay.getTime()) });
  if (!data) return null;

  await db.insert(editions)
    .values({ date, number: data.number, theme: data.theme.key, headline: data.cover.headline, data })
    .onConflictDoUpdate({
      target: editions.date,
      set: { number: data.number, theme: data.theme.key, headline: data.cover.headline, data, updatedAt: new Date() },
    });
  return data;
}

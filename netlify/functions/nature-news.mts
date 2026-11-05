import type { Config } from "@netlify/functions";
import { lastFetch, latestNatureNews, refreshNatureNews } from "../../lib/nature.js";

// GET /api/nature-news — latest stored nature stories. Refreshes on demand when the
// stored copy is older than 6 hours, so the section stays current even between scheduled runs.
export default async (req: Request) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const limit = Math.min(Number(new URL(req.url).searchParams.get("limit")) || 30, 60);
  let status: { ok: string[]; failed: string[] } | null = null;
  try {
    if (Date.now() - (await lastFetch()) > 6 * 36e5) status = await refreshNatureNews(7000);
  } catch (e) {
    console.error("nature refresh failed", e);
  }
  try {
    const rows = await latestNatureNews(limit);
    return Response.json({
      updatedAt: await lastFetch(),
      failed: status?.failed ?? [],
      items: rows.map((r) => ({ link: r.link, source: r.source, lang: r.lang, topic: r.topic, title: r.title, summary: r.summary, image: r.image, publishedAt: r.publishedAt.toISOString() })),
    }, { headers: { "cache-control": "public, max-age=300, s-maxage=900" } });
  } catch (e) {
    console.error("nature news error", e);
    return Response.json({ items: [], error: "No se pudieron cargar las noticias" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
};

export const config: Config = { path: "/api/nature-news" };

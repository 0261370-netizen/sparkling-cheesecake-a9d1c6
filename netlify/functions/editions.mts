import type { Config, Context } from "@netlify/functions";
import { desc, eq, lte } from "drizzle-orm";
import { db } from "../../db/index.js";
import { editions } from "../../db/schema.js";
import { publishEdition } from "../../lib/publish.js";
import { isValidDate, mexicoNow, PUBLISH_HOUR, type EditionData } from "../../lib/edition.js";

const json = (body: unknown, status = 200, maxAge = 300) =>
  Response.json(body, {
    status,
    headers: { "cache-control": status === 200 ? `public, max-age=60, s-maxage=${maxAge}` : "no-store" },
  });

async function latestEdition() {
  const { date: today, hour } = mexicoNow();
  const [latest] = await db.select().from(editions).where(lte(editions.date, today)).orderBy(desc(editions.date)).limit(1);
  // Publish on demand if nothing exists yet, or if this morning's scheduled run hasn't happened.
  if (!latest || (latest.date < today && hour >= PUBLISH_HOUR)) {
    try {
      const data = await publishEdition(today);
      if (data) return data;
    } catch (e) {
      console.error("On-demand publishing failed", e);
    }
  }
  return (latest?.data as EditionData) ?? null;
}

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const url = new URL(req.url);

  if (url.pathname === "/api/editions") {
    const limit = Math.min(Number(url.searchParams.get("limit")) || 60, 365);
    const rows = await db.select().from(editions).where(lte(editions.date, mexicoNow().date)).orderBy(desc(editions.date)).limit(limit);
    return json(rows.map((r) => {
      const d = r.data as EditionData;
      return {
        date: r.date, number: r.number, theme: d.theme, headline: r.headline,
        featured: { title: d.featured.title, source: d.featured.source, image: d.featured.image },
        colors: d.color.swatches.map((s) => s.hex),
      };
    }));
  }

  const date = context.params?.date;
  if (date) {
    if (!isValidDate(date)) return json({ error: "Fecha no válida" }, 400);
    const [row] = await db.select().from(editions).where(eq(editions.date, date)).limit(1);
    if (!row) return json({ error: "No hay edición para esa fecha" }, 404);
    return json(row.data, 200, 3600);
  }

  const edition = await latestEdition();
  if (!edition) return json({ error: "La edición se está imprimiendo" }, 503);
  return json(edition);
};

export const config: Config = {
  path: ["/api/edition", "/api/edition/:date", "/api/editions"],
};

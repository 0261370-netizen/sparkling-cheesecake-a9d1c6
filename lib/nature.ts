// Nature news for "Bitácora silvestre": real stories from publishers' RSS feeds.
// Every item keeps its original title, source, link and date — nothing is invented or rewritten.
import { desc, max, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { natureNews } from "../db/schema.js";
import { parseFeed, type FeedDef } from "./feeds.js";

type NatureFeed = FeedDef & { lang: "es" | "en"; strict?: boolean };

export const NATURE_FEEDS: NatureFeed[] = [
  { source: "Mongabay Latam", url: "https://es.mongabay.com/feed/", topic: "Conservación", lang: "es" },
  { source: "ScienceDaily", url: "https://www.sciencedaily.com/rss/plants_animals/new_species.xml", topic: "Especies nuevas", lang: "en" },
  { source: "ScienceDaily", url: "https://www.sciencedaily.com/rss/plants_animals.xml", topic: "Animales y plantas", lang: "en", strict: true },
  { source: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/rss/science-nature/", topic: "Naturaleza", lang: "en", strict: true },
  { source: "Live Science", url: "https://www.livescience.com/feeds/tag/animals", topic: "Animales", lang: "en" },
  { source: "Phys.org", url: "https://phys.org/rss-feed/biology-news/plants-animals/", topic: "Animales y plantas", lang: "en", strict: true },
  { source: "Mongabay", url: "https://news.mongabay.com/feed", topic: "Conservación", lang: "en" },
];

// Light topic refinement from words in the title/summary (Spanish and English).
const TOPICS: [string, RegExp][] = [
  ["Océanos", /\b(ocean|marine|sea|reef|coral|whale|shark|fish|octopus|squid|jellyfish|océano|marin[oa]s?|mar|arrecife|ballena|tiburón|peces?|pulpo|medusa)\b/i],
  ["Insectos", /\b(insects?|beetles?|bees?|ants?|butterfl(y|ies)|moths?|wasps?|insectos?|escarabajos?|abejas?|hormigas?|mariposas?|polillas?)\b/i],
  ["Plantas", /\b(plants?|trees?|flowers?|seeds?|forests?|leaf|leaves|fungi|fungus|mushrooms?|plantas?|árbol(es)?|flor(es)?|semillas?|bosques?|hongos?)\b/i],
  ["Aves", /\b(birds?|parrots?|owls?|eagles?|aves?|pájaros?|loros?|búhos?|águilas?)\b/i],
  ["Reptiles y anfibios", /\b(reptiles?|lizards?|snakes?|turtles?|frogs?|amphibians?|salamanders?|lagartos?|serpientes?|tortugas?|ranas?|anfibios?|ajolotes?)\b/i],
];
// Broad feeds (science sections) also publish physics, health or maths: keep only nature stories.
const NATURE = /\b(animals?|species|wildlife|plants?|trees?|forests?|ocean|marine|reefs?|corals?|birds?|ducks?|geese|goose|mice|mouse|rats?|cats?|dogs?|horses?|cattle|sheep|goats?|bugs?|mosquito(es)?|ticks?|flies|wasps?|insects?|fish|frogs?|reptiles?|mammals?|fungi|fungus|mushrooms?|ecosystems?|biodiversity|predators?|prey|habitat|beetles?|bees?|ants?|spiders?|whales?|sharks?|snakes?|lizards?|bats?|primates?|flowers?|seeds?|pollinat\w*|evolution\w*|fossils?|dinosaurs?|nature|jungle|wetlands?|desert|moths?|butterfl(y|ies)|octopus|squid|crabs?|shrimp|worms?|salamanders?|turtles?|crocodiles?|elephants?|wolves|wolf|bears?|deer|monkeys?|apes?|orcas?|dolphins?|seals?|penguins?|parrots?|owls?|eagles?|algae|moss|lichens?)\b/i;

const refine = (title: string, summary: string, fallback: string) => {
  if (fallback === "Especies nuevas") return fallback;
  const text = `${title} ${summary}`;
  return TOPICS.find(([, re]) => re.test(text))?.[0] ?? fallback;
};

async function fetchOne(def: NatureFeed, timeoutMs: number) {
  const res = await fetch(def.url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; TheDesignLibrary/1.0; +https://sparkling-cheesecake-a9d1c6.netlify.app)", accept: "application/rss+xml, application/xml, text/xml" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseFeed(await res.text(), def)
    .filter((i) => !def.strict || NATURE.test(`${i.title} ${i.summary}`))
    .map((i) => ({ ...i, lang: def.lang, topic: refine(i.title, i.summary, def.topic) }));
}

export async function refreshNatureNews(timeoutMs = 8000) {
  const results = await Promise.allSettled(NATURE_FEEDS.map((f) => fetchOne(f, timeoutMs)));
  const seen = new Map<string, Awaited<ReturnType<typeof fetchOne>>[number]>();
  const ok: string[] = [], failed: string[] = [];
  results.forEach((r, i) => {
    const name = `${NATURE_FEEDS[i].source} (${NATURE_FEEDS[i].topic})`;
    if (r.status === "fulfilled" && r.value.length) { ok.push(name); r.value.forEach((it) => { if (!seen.has(it.link)) seen.set(it.link, it); }); }
    else failed.push(name);
  });
  const items = [...seen.values()].filter((i) => i.publishedAt.getTime() <= Date.now() + 864e5);
  for (let i = 0; i < items.length; i += 100) {
    await db.insert(natureNews).values(items.slice(i, i + 100)).onConflictDoUpdate({
      target: natureNews.link,
      set: { summary: sql`excluded.summary`, topic: sql`excluded.topic`, fetchedAt: sql`now()`, image: sql`CASE WHEN excluded.image <> '' THEN excluded.image ELSE ${natureNews.image} END` },
    });
  }
  return { ok, failed, stored: items.length };
}

export async function lastFetch(): Promise<number> {
  const [row] = await db.select({ t: max(natureNews.fetchedAt) }).from(natureNews);
  return row?.t ? new Date(row.t).getTime() : 0;
}

export async function latestNatureNews(limit = 30) {
  return db.select().from(natureNews).orderBy(desc(natureNews.publishedAt)).limit(limit);
}

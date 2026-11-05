// Builds one edition of THE DESIGN DAILY from stored RSS articles + the curated editorial archive.
import {
  THEMES, THEMES_BY_WEEKDAY, COVER_LINES, COLOR_STORIES, OBJECTS, CHALLENGES,
  type ThemeKey, type CoverLine, type ColorStory, type DesignObject, type Challenge,
} from "./editorial.js";

export const TIMEZONE = "America/Mexico_City";
// Same origin as the daily moodboard on the page, so issue numbers match everywhere.
const EPOCH = Date.UTC(2026, 10, 1);
export const PUBLISH_HOUR = 6;

export type Story = {
  title: string;
  summary: string;
  link: string;
  source: string;
  topic: string;
  image: string;
  publishedAt: string;
};

export type ArticleRow = {
  link: string; source: string; topic: string; title: string; summary: string; image: string; publishedAt: Date;
};

export type WeekEntry = { date: string; number: number; theme: string; headline: string; featured?: { title: string; link: string; source: string } };

export type EditionData = {
  date: string;
  number: number;
  theme: { key: ThemeKey; name: string; day: string; kicker: string; description: string };
  cover: CoverLine;
  featured: Story;
  stories: Story[];
  color: ColorStory;
  object: DesignObject;
  challenge: Challenge;
  week: WeekEntry[];
  sources: { ok: string[]; failed: string[] };
  usedStoredArticles: boolean;
  generatedAt: string;
};

/** Local date (YYYY-MM-DD) and hour in Mexico City. */
export function mexicoNow(now = new Date()): { date: string; hour: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
      .formatToParts(now).map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

export function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + "T00:00:00Z"));
}

export function editionNumber(date: string): number {
  return Math.round((Date.parse(date + "T00:00:00Z") - EPOCH) / 864e5) + 1;
}

export function themeFor(date: string): ThemeKey {
  return THEMES_BY_WEEKDAY[new Date(date + "T00:00:00Z").getUTCDay()];
}

const pick = <T>(list: T[], n: number): T => list[((n % list.length) + list.length) % list.length];

function score(a: ArticleRow, theme: ThemeKey, now: number): number {
  const text = ` ${a.title} ${a.summary} ${a.topic} `.toLowerCase();
  const kws = THEMES[theme].keywords;
  let s = 0;
  for (const k of kws) if (text.includes(k)) s += a.title.toLowerCase().includes(k) ? 3 : 1;
  const topicBoost: Partial<Record<ThemeKey, string[]>> = {
    nature: ["Biofilia"], color: ["Color", "Materiales"], industrial: ["Diseño industrial", "Materiales"],
    furniture: ["Mobiliario"], experimental: ["Conceptos"],
  };
  if (topicBoost[theme]?.includes(a.topic)) s += 4;
  const ageDays = (now - a.publishedAt.getTime()) / 864e5;
  s += Math.max(0, 6 - ageDays) * (theme === "review" ? 0.4 : 0.9); // fresher is better
  if (a.image) s += 1.5;
  return s;
}

const toStory = (a: ArticleRow): Story => ({
  title: a.title, summary: a.summary, link: a.link, source: a.source, topic: a.topic, image: a.image,
  publishedAt: a.publishedAt.toISOString(),
});

/** Chooses one featured story and four secondary stories, varying sources and avoiding recent repeats. */
export function selectStories(articles: ArticleRow[], theme: ThemeKey, recentLinks: Set<string>, now = Date.now()) {
  const unique = [...new Map(articles.map((a) => [a.link, a])).values()];
  let pool = unique.filter((a) => !recentLinks.has(a.link));
  if (pool.length < 5) pool = unique; // never leave the cover empty
  const ranked = pool.map((a) => ({ a, s: score(a, theme, now) })).sort((x, y) => y.s - x.s).map((x) => x.a);

  const featured = ranked.find((a) => a.image && a.summary.length > 40) ?? ranked[0];
  const rest: ArticleRow[] = [];
  const perSource = new Map<string, number>([[featured?.source ?? "", 1]]);
  for (const a of ranked) {
    if (rest.length >= 4) break;
    if (a === featured) continue;
    const n = perSource.get(a.source) ?? 0;
    if (n >= 2) continue;
    perSource.set(a.source, n + 1);
    rest.push(a);
  }
  for (const a of ranked) { // fill up if source diversity left gaps
    if (rest.length >= 4) break;
    if (a !== featured && !rest.includes(a)) rest.push(a);
  }
  return { featured: featured ? toStory(featured) : undefined, stories: rest.map(toStory) };
}

export function buildEdition(input: {
  date: string;
  articles: ArticleRow[];
  recentLinks: Set<string>;
  week: WeekEntry[];
  sources: { ok: string[]; failed: string[] };
  now?: number;
}): EditionData | null {
  const { date } = input;
  const number = editionNumber(date);
  const key = themeFor(date);
  const t = THEMES[key];
  const { featured, stories } = selectStories(input.articles, key, input.recentLinks, input.now);
  if (!featured) return null;

  // Each weekday theme returns once a week, so rotate its curated pieces week by week.
  const week = Math.floor((number - 1) / 7);
  const objects = key === "review" ? OBJECTS : OBJECTS.filter((o) => o.tags.includes(key));
  const object = pick(objects.length ? objects : OBJECTS, key === "review" ? number : week + number);
  const newest = Math.max(...input.articles.map((a) => a.publishedAt.getTime()));

  return {
    date,
    number,
    theme: { key, name: t.name, day: t.day, kicker: t.kicker, description: t.description },
    cover: pick(COVER_LINES[key], week),
    featured,
    stories,
    color: pick(COLOR_STORIES[key], week),
    object,
    challenge: pick(CHALLENGES[key], week),
    week: key === "review" ? input.week : [],
    sources: input.sources,
    usedStoredArticles: input.sources.ok.length === 0 || (input.now ?? Date.now()) - newest > 2 * 864e5,
    generatedAt: new Date(input.now ?? Date.now()).toISOString(),
  };
}

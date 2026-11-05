// Collects articles from design publishers' RSS feeds.
// Every item keeps its original source, link and publication date — nothing is invented.

export type FeedItem = {
  link: string;
  source: string;
  topic: string;
  title: string;
  summary: string;
  image: string;
  publishedAt: Date;
};

export type FeedDef = { source: string; url: string; topic: string };

// Order matters: specific topic feeds come first so an article keeps its most specific topic.
export const FEEDS: FeedDef[] = [
  { source: "Dezeen", url: "https://www.dezeen.com/tag/biomimicry/feed/", topic: "Biofilia" },
  { source: "Dezeen", url: "https://www.dezeen.com/tag/materials/feed/", topic: "Materiales" },
  { source: "Dezeen", url: "https://www.dezeen.com/tag/colour/feed/", topic: "Color" },
  { source: "Dezeen", url: "https://www.dezeen.com/design/furniture/feed/", topic: "Mobiliario" },
  { source: "Dezeen", url: "https://www.dezeen.com/design/feed/", topic: "Diseño" },
  { source: "Designboom", url: "https://www.designboom.com/design/feed/", topic: "Diseño" },
  { source: "Design Milk", url: "https://design-milk.com/feed/", topic: "Diseño" },
  { source: "Core77", url: "https://www.core77.com/blog/rss.xml", topic: "Diseño industrial" },
  { source: "Yanko Design", url: "https://www.yankodesign.com/feed/", topic: "Conceptos" },
];

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", mdash: "—", ndash: "–",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", eacute: "é", aacute: "á", iacute: "í", oacute: "ó",
  uacute: "ú", ntilde: "ñ", uuml: "ü", ouml: "ö", auml: "ä", times: "×",
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

const unCdata = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? unCdata(m[1]).trim() : "";
}

function stripHtml(raw: string): string {
  const html = /&lt;\/?[a-z]/i.test(raw) ? decodeEntities(raw) : raw;
  return decodeEntities(
    html
      .replace(/<p>The post [\s\S]*?appeared first on[\s\S]*?<\/p>/gi, " ")
      .replace(/<(script|style|figure|figcaption)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/The post .* appeared first on .*$/i, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function clip(s: string, n: number): string {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), n - 20)).replace(/[,;:.\s]+$/, "") + "…";
}

function findImage(block: string): string {
  const candidates = [
    block.match(/<media:content[^>]+url="([^"]+)"/i)?.[1],
    block.match(/<media:thumbnail[^>]+url="([^"]+)"/i)?.[1],
    block.match(/<enclosure[^>]+url="([^"]+\.(?:jpe?g|png|webp)[^"]*)"/i)?.[1],
    unCdata(block).match(/<img[^>]+src="([^"]+)"/i)?.[1],
    decodeEntities(block).match(/<img[^>]+src="([^"]+)"/i)?.[1],
  ];
  const url = candidates.find((u) => u && /^https:\/\//.test(u));
  return url ? decodeEntities(url) : "";
}

function cleanLink(link: string): string {
  try {
    const u = new URL(link);
    [...u.searchParams.keys()].filter((k) => k.startsWith("utm_")).forEach((k) => u.searchParams.delete(k));
    return u.toString();
  } catch {
    return link;
  }
}

export function parseFeed(xml: string, def: FeedDef): FeedItem[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  const items: FeedItem[] = [];
  for (const block of blocks) {
    const title = clip(stripHtml(tag(block, "title")), 200);
    const link = cleanLink(decodeEntities(tag(block, "link")).trim());
    const date = new Date(tag(block, "pubDate") || tag(block, "dc:date") || tag(block, "a10:updated") || tag(block, "updated"));
    if (!title || !/^https?:\/\//.test(link) || Number.isNaN(date.getTime())) continue;
    let summary = stripHtml(tag(block, "description"));
    if (summary.length < 40) summary = stripHtml(tag(block, "content:encoded"));
    if (summary.toLowerCase().startsWith(title.toLowerCase())) summary = summary.slice(title.length).trim();
    summary = summary.replace(/\[(?:…|\.\.\.)\]\s*$/, "").replace(/\.{3}$/, "…").trim();
    items.push({
      link,
      source: def.source,
      topic: def.topic,
      title,
      summary: clip(summary, 340),
      image: findImage(block),
      publishedAt: date,
    });
  }
  return items;
}

async function fetchFeed(def: FeedDef, timeoutMs: number): Promise<FeedItem[]> {
  const res = await fetch(def.url, {
    headers: { "user-agent": "TheDesignDaily/1.0 (+https://sparkling-cheesecake-a9d1c6.netlify.app)", accept: "application/rss+xml, application/xml, text/xml" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseFeed(await res.text(), def);
}

export type CollectResult = { items: FeedItem[]; ok: string[]; failed: string[] };

export async function collectFeeds(timeoutMs = 8000): Promise<CollectResult> {
  const results = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f, timeoutMs)));
  const seen = new Map<string, FeedItem>();
  const ok = new Set<string>();
  const failedFeeds: string[] = [];
  results.forEach((r, i) => {
    const def = FEEDS[i];
    if (r.status === "fulfilled" && r.value.length) {
      ok.add(def.source);
      for (const item of r.value) if (!seen.has(item.link)) seen.set(item.link, item);
    } else {
      failedFeeds.push(def.source);
    }
  });
  const failed = [...new Set(failedFeeds)].filter((s) => !ok.has(s));
  return { items: [...seen.values()], ok: [...ok], failed };
}

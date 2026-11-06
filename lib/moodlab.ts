// Moodboard Lab — server helpers: Pexels search with cache, rate limits and AI prompts.
// Every visual reference comes from the Pexels API; the model only writes queries,
// picks relevant results from their metadata and writes sketch challenges.
import Anthropic from "@anthropic-ai/sdk";
import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

export const PLAN_MODEL = "claude-sonnet-5-5";
export const FAST_MODEL = "claude-haiku-5-5";

// Pexels documents 200 requests/hour and 20,000/month per key. We stay under that globally
// and cache each (query, page) response so repeated searches don't spend quota.
const PEXELS_HOURLY_BUDGET = 170;
const SEARCH_CACHE_TTL = 24 * 3600 * 1000;
const PLAN_CACHE_TTL = 24 * 3600 * 1000;

export const clip = (v: unknown, n: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);
export const hash = (...parts: unknown[]) => createHash("sha256").update(parts.map((p) => JSON.stringify(p)).join("|")).digest("hex").slice(0, 40);

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public extra: Record<string, unknown> = {}) { super(message); }
}

// Pexels when PEXELS_API_KEY is set; otherwise Openverse (anonymous, CC-licensed images) as a keyless fallback.
export const imageProvider = (): "pexels" | "openverse" => (process.env.PEXELS_API_KEY ? "pexels" : "openverse");

export function missingConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.ANTHROPIC_API_KEY && !process.env.NETLIFY_AI_GATEWAY_KEY) missing.push("AI Gateway (ANTHROPIC_API_KEY)");
  return missing;
}

// ---------- storage ----------
const cacheStore = () => getStore({ name: "moodlab-cache" });
const limitStore = () => getStore({ name: "moodlab-limits", consistency: "strong" });

async function cacheGet<T>(key: string, ttl: number): Promise<T | null> {
  try {
    const hit = (await cacheStore().get(key, { type: "json" })) as { at: number; data: T } | null;
    if (hit && Date.now() - hit.at < ttl) return hit.data;
  } catch (e) { console.warn("moodlab cache read failed", e); }
  return null;
}
async function cacheSet(key: string, data: unknown) {
  try { await cacheStore().setJSON(key, { at: Date.now(), data }); } catch (e) { console.warn("moodlab cache write failed", e); }
}

// Fixed-window counter. Blobs are not atomic, so this is a soft limit — good enough to stop abuse.
async function bump(key: string, limit: number, windowMs: number): Promise<{ ok: boolean; retry: number }> {
  const store = limitStore();
  const win = Math.floor(Date.now() / windowMs);
  const k = `${key}:${win}`;
  const cur = Number(((await store.get(k, { type: "json" })) as { n: number } | null)?.n || 0);
  if (cur >= limit) return { ok: false, retry: Math.ceil(((win + 1) * windowMs - Date.now()) / 1000) };
  await store.setJSON(k, { n: cur + 1 });
  return { ok: true, retry: 0 };
}

export const LIMITS = {
  search: { limit: 12, windowMs: 3600_000 }, // "Buscar inspiración" per visitor per hour
  more: { limit: 40, windowMs: 3600_000 },   // "Buscar otras"
  challenge: { limit: 60, windowMs: 3600_000 },
};

export async function rateLimit(ip: string, action: keyof typeof LIMITS) {
  const { limit, windowMs } = LIMITS[action];
  const r = await bump(`ip:${hash(ip)}:${action}`, limit, windowMs);
  if (!r.ok) throw new HttpError(429, "rate_limited", `Has alcanzado el límite de ${limit} solicitudes por hora para esta acción. Prueba de nuevo en ${Math.ceil(r.retry / 60)} min.`, { retryAfter: r.retry });
}

// ---------- Pexels ----------
export type Ref = {
  id: string; provider: "pexels" | "openverse"; title?: string; license?: string; licenseUrl?: string; source?: string; page: string; image: string; thumb: string; width: number; height: number;
  alt: string; credit: string; creditUrl: string; color: string; query: string; kind?: string; why?: string;
};

type PexelsPhoto = {
  id: number; width: number; height: number; url: string; photographer: string; photographer_url: string;
  avg_color: string; alt: string; src: Record<string, string>;
};

const sized = (orig: string, w: number) => `${orig.split("?")[0]}?auto=compress&cs=tinysrgb&w=${w}`;

function toRef(p: PexelsPhoto, query: string): Ref {
  return {
    id: `px-${p.id}`, provider: "pexels", page: p.url, image: sized(p.src.original, 900), thumb: sized(p.src.original, 480),
    width: p.width, height: p.height, alt: clip(p.alt, 240), credit: clip(p.photographer, 80), creditUrl: p.photographer_url,
    color: /^#[0-9a-f]{6}$/i.test(p.avg_color) ? p.avg_color : "#e8e0d2", query,
  };
}

export const imageSearch = (query: string, page = 1, lang = "en") =>
  imageProvider() === "pexels" ? pexelsSearch(query, page, lang) : openverseSearch(query, page);

// ---------- Openverse (no key) ----------
// Anonymous limits: 20 req/min and 200 req/day. We cache each (query, page) for 24 h and stay under both.
type OVImage = {
  id: string; title?: string; foreign_landing_url?: string; url?: string; thumbnail?: string; creator?: string; creator_url?: string;
  license?: string; license_version?: string; license_url?: string; source?: string; width?: number; height?: number;
  tags?: { name: string }[]; mature?: boolean;
};

export async function openverseSearch(query: string, page = 1): Promise<Ref[]> {
  const q = clip(query, 100);
  const key = `ov:${hash(q.toLowerCase(), page)}`;
  const cached = await cacheGet<Ref[]>(key, SEARCH_CACHE_TTL);
  if (cached) return cached;
  const day = await bump("global:openverse:day", 180, 24 * 3600_000);
  const min = day.ok ? await bump("global:openverse:min", 18, 60_000) : day;
  if (!min.ok) throw new HttpError(429, "provider_budget", "Se alcanzó el cupo de búsquedas gratuitas sin clave (Openverse). Configura PEXELS_API_KEY o prueba más tarde.", { retryAfter: min.retry });

  const url = new URL("https://api.openverse.org/v1/images/");
  url.searchParams.set("q", q);
  url.searchParams.set("page_size", "15");
  url.searchParams.set("page", String(page));
  url.searchParams.set("mature", "false");
  const res = await fetch(url, { headers: { "User-Agent": "TheDesignLibrary-MoodboardLab/1.0 (Netlify)" } });
  if (res.status === 429) throw new HttpError(429, "provider_budget", "Openverse ha limitado temporalmente las búsquedas. Prueba de nuevo más tarde.");
  if (res.status === 400 || res.status === 404) { await cacheSet(key, []); return []; } // past the last page
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  const json = (await res.json()) as { results?: OVImage[] };
  const refs: Ref[] = (json.results || []).filter((r) => r?.id && r.thumbnail && r.foreign_landing_url && !r.mature).map((r) => {
    const tags = (r.tags || []).map((t) => t.name).filter(Boolean).slice(0, 8).join(", ");
    const lic = r.license ? `CC ${r.license.toUpperCase()}${r.license_version ? " " + r.license_version : ""}`.replace("CC PDM", "Dominio público").replace("CC CC0", "CC0") : "";
    return {
      id: `ov-${r.id}`, provider: "openverse", page: r.foreign_landing_url!, image: r.thumbnail!, thumb: r.thumbnail!,
      width: Number(r.width) || 0, height: Number(r.height) || 0, title: clip(r.title, 160),
      alt: clip([r.title, tags && `etiquetas: ${tags}`].filter(Boolean).join(" — "), 240),
      credit: clip(r.creator, 80), creditUrl: r.creator_url || "", color: "#e8e0d2", query: q,
      license: lic, licenseUrl: r.license_url || "", source: clip(r.source, 40),
    };
  });
  await cacheSet(key, refs);
  return refs;
}

export async function pexelsSearch(query: string, page = 1, lang = "en"): Promise<Ref[]> {
  const q = clip(query, 100);
  const locale = lang === "es" ? "es-ES" : "en-US";
  const key = `px:${hash(q.toLowerCase(), page, locale)}`;
  const cached = await cacheGet<Ref[]>(key, SEARCH_CACHE_TTL);
  if (cached) return cached;

  const budget = await bump("global:pexels", PEXELS_HOURLY_BUDGET, 3600_000);
  if (!budget.ok) throw new HttpError(429, "provider_budget", "Se alcanzó el cupo horario de búsquedas de imágenes del sitio. Prueba de nuevo más tarde.", { retryAfter: budget.retry });

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", q);
  url.searchParams.set("per_page", "15");
  url.searchParams.set("page", String(page));
  url.searchParams.set("locale", locale);
  const res = await fetch(url, { headers: { Authorization: process.env.PEXELS_API_KEY || "" } });
  if (res.status === 401 || res.status === 403) throw new HttpError(503, "config", "La clave de Pexels no es válida. Revisa la variable PEXELS_API_KEY.", { missing: ["PEXELS_API_KEY"] });
  if (res.status === 429) throw new HttpError(429, "provider_budget", "Pexels ha limitado temporalmente las búsquedas. Prueba de nuevo más tarde.");
  if (!res.ok) throw new Error(`Pexels ${res.status}`);
  const json = (await res.json()) as { photos?: PexelsPhoto[] };
  const refs = (json.photos || []).filter((p) => p?.src?.original).map((p) => toRef(p, q));
  await cacheSet(key, refs);
  return refs;
}

// ---------- AI ----------
export type Query = { q: string; lang: "en" | "es"; kind: string };
export type Direction = { key: string; angle: string; name: string; explores: string; question: string; queries: Query[] };

const KINDS = ["objeto", "detalle", "material", "arquitectura", "naturaleza"];
const anthropic = () => new Anthropic();

async function tool<T>(model: string, system: string, user: string, name: string, schema: Record<string, unknown>, maxTokens = 1500): Promise<T> {
  const msg = await anthropic().messages.create({
    model, max_tokens: maxTokens, system,
    tools: [{ name, description: "Devuelve la respuesta estructurada.", input_schema: schema as never }],
    tool_choice: { type: "tool", name },
    messages: [{ role: "user", content: user }],
  });
  const block = msg.content.find((b) => b.type === "tool_use");
  if (!block || !("input" in block)) throw new Error("No structured answer");
  return block.input as T;
}

const QUERY_SCHEMA = {
  type: "object",
  properties: {
    q: { type: "string", description: "Consulta de 2 a 6 palabras para un banco de fotos. Concreta y visual." },
    lang: { type: "string", enum: ["en", "es"] },
    kind: { type: "string", enum: KINDS },
  },
  required: ["q", "lang", "kind"],
};

function normQueries(v: unknown): Query[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  return v.map((x) => ({ q: clip(x?.q, 80), lang: x?.lang === "es" ? "es" : "en", kind: KINDS.includes(x?.kind) ? x.kind : "objeto" } as Query))
    .filter((x) => x.q && !seen.has(x.q.toLowerCase()) && seen.add(x.q.toLowerCase())).slice(0, 4);
}

export function normDirection(d: Record<string, unknown>, i: number): Direction {
  return {
    key: clip(d.key, 20) || ["funcion", "construccion", "analogia"][i] || `ruta${i}`,
    angle: clip(d.angle, 40), name: clip(d.name, 70), explores: clip(d.explores, 240), question: clip(d.question, 200),
    queries: normQueries(d.queries),
  };
}

export async function planDirections(concept: string): Promise<Direction[]> {
  const key = `plan:${hash(concept.toLowerCase())}`;
  const cached = await cacheGet<Direction[]>(key, PLAN_CACHE_TTL);
  if (cached) return cached;

  const out = await tool<{ directions: Record<string, unknown>[] }>(PLAN_MODEL,
    "Eres director creativo de diseño de producto y mobiliario. Ayudas a pasar de una idea vaga a tres direcciones que se puedan bocetar. " +
    "Para proyectos de producto parte de tres ángulos y adáptalos al concepto: 1) FUNCIÓN (cómo se usa, qué resuelve), " +
    "2) CONSTRUCCIÓN (uniones, procesos, material), 3) ANALOGÍA INESPERADA (arquitectura, naturaleza, otro objeto con la misma lógica). " +
    "Si el concepto no es de producto, adapta los ángulos con criterio. Las tres rutas deben responder preguntas de diseño distintas. " +
    "Para cada ruta escribe en español de México: un nombre corto y evocador, una frase que explique qué explora y la pregunta de diseño que responde. " +
    "Después escribe 4 consultas para un banco de fotos: específicas y visuales, que devuelvan fotos reales. Preferentemente en inglés; " +
    "usa español solo si ayuda. Mezcla tipos (objeto, detalle constructivo, material, arquitectura, naturaleza) cuando aporten. " +
    "Evita consultas abstractas o de conceptos que no se fotografían (p. ej. 'innovación'). No repitas consultas entre rutas.",
    `Concepto: ${concept}`, "directions",
    {
      type: "object",
      properties: {
        directions: {
          type: "array", minItems: 3, maxItems: 3,
          items: {
            type: "object",
            properties: {
              key: { type: "string", enum: ["funcion", "construccion", "analogia"] },
              angle: { type: "string", description: "Ángulo en 1 a 3 palabras: Función, Construcción o Analogía…" },
              name: { type: "string" }, explores: { type: "string" }, question: { type: "string" },
              queries: { type: "array", minItems: 3, maxItems: 4, items: QUERY_SCHEMA },
            },
            required: ["key", "angle", "name", "explores", "question", "queries"],
          },
        },
      },
      required: ["directions"],
    }, 2000);
  const dirs = (out.directions || []).slice(0, 3).map(normDirection).filter((d) => d.name && d.queries.length);
  if (dirs.length < 3) throw new Error("Incomplete plan");
  await cacheSet(key, dirs);
  return dirs;
}

// Ask for fresh queries when a route runs out of new results.
export async function moreQueries(concept: string, d: Direction): Promise<Query[]> {
  const out = await tool<{ queries: unknown[] }>(FAST_MODEL,
    "Eres investigador visual de diseño de producto. Propón consultas nuevas para un banco de fotos, concretas y fotografiables, " +
    "distintas de las ya usadas, que sigan respondiendo la pregunta de diseño de la ruta.",
    `Concepto: ${concept}\nRuta: ${d.name} (${d.angle}) — ${d.explores}\nPregunta: ${d.question}\nYa usadas: ${d.queries.map((q) => q.q).join("; ")}`,
    "queries", { type: "object", properties: { queries: { type: "array", minItems: 2, maxItems: 3, items: QUERY_SCHEMA } }, required: ["queries"] }, 600);
  const used = new Set(d.queries.map((q) => q.q.toLowerCase()));
  return normQueries(out.queries).filter((q) => !used.has(q.q.toLowerCase()));
}

// Pick the relevant candidates for each route using only Pexels metadata (alt text + query).
export async function curate(concept: string, groups: { d: Direction; cands: Ref[]; need: number }[]): Promise<Map<string, { kind: string; why: string }>> {
  const lines = groups.map(({ d, cands, need }) =>
    `## Ruta ${d.key}: ${d.name} — ${d.explores} (elige hasta ${need})\n` +
    cands.map((c) => `- ${c.id} | consulta: ${c.query} | descripción: ${c.alt || "(sin descripción)"}`).join("\n")).join("\n\n");
  const out = await tool<{ picks: { id: string; kind: string; why: string }[] }>(FAST_MODEL,
    "Eres curador de moodboards para diseño de producto. Recibes fotos candidatas de un banco de imágenes con su consulta y su descripción (texto alternativo, título o etiquetas). " +
    "Elige solo las que sean pertinentes para la ruta y el concepto según su descripción. Si una foto no tiene descripción, " +
    "acéptala solo si la consulta es muy específica. Prefiere variedad: mezcla objetos, detalles constructivos, materiales, arquitectura o naturaleza " +
    "cuando aporte, y evita fotos casi iguales. Es mejor elegir menos que elegir fotos irrelevantes. " +
    "Para cada elegida indica su tipo y, en español y en máximo 14 palabras, qué aporta (solo lo que dice la descripción).",
    `Concepto: ${concept}\n\n${lines}`, "picks",
    {
      type: "object",
      properties: {
        picks: {
          type: "array",
          items: { type: "object", properties: { id: { type: "string" }, kind: { type: "string", enum: KINDS }, why: { type: "string" } }, required: ["id", "kind", "why"] },
        },
      },
      required: ["picks"],
    }, 1800);
  const map = new Map<string, { kind: string; why: string }>();
  for (const p of out.picks || []) if (p?.id) map.set(String(p.id), { kind: KINDS.includes(p.kind) ? p.kind : "objeto", why: clip(p.why, 140) });
  return map;
}

export async function sketchChallenge(concept: string, d: { name: string; explores: string }, ref: { alt: string; query: string; credit: string }): Promise<string> {
  const key = `ch:${hash(concept.toLowerCase(), d.name, ref.alt, ref.query)}`;
  const cached = await cacheGet<string>(key, 7 * 24 * 3600 * 1000);
  if (cached) return cached;
  const out = await tool<{ challenge: string }>(FAST_MODEL,
    "Eres mentor de diseño de producto. Escribes un reto de boceto breve en español de México (máximo 45 palabras, 2 frases: " +
    "una instrucción concreta que empiece con un verbo y una pregunta). Conecta la referencia con el proyecto del usuario. " +
    "Usa SOLO detalles que estén en la descripción de la imagen o en su consulta de búsqueda; no inventes colores, materiales ni formas que no se mencionen. " +
    "Si la descripción es pobre, apóyate en la consulta y dilo con prudencia.",
    `Proyecto: ${concept}\nRuta: ${d.name} — ${d.explores}\nReferencia: descripción "${ref.alt || "sin descripción"}"; consulta "${ref.query}".`,
    "challenge", { type: "object", properties: { challenge: { type: "string" } }, required: ["challenge"] }, 400);
  const text = clip(out.challenge, 400);
  if (!text) throw new Error("Empty challenge");
  await cacheSet(key, text);
  return text;
}

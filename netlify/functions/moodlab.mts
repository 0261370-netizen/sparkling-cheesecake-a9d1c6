import type { Config, Context } from "@netlify/functions";
import {
  HttpError, clip, curate, missingConfig, moreQueries, normDirection, imageSearch, imageProvider, planDirections, rateLimit, sketchChallenge,
  type Direction, type Ref,
} from "../../lib/moodlab.js";

// Moodboard Lab API. POST /api/moodlab with { action: "search" | "more" | "challenge", ... }.
// Runs only when the visitor presses a button; every reference comes from the image API
// (Pexels with PEXELS_API_KEY, Openverse without a key).

const PER_ROUTE = 4;
const CANDIDATES_PER_ROUTE = 10;

type Settled<T> = { ok: true; value: T } | { ok: false; error: unknown };
const settle = <T,>(p: Promise<T>): Promise<Settled<T>> => p.then((value) => ({ ok: true as const, value }), (error) => ({ ok: false as const, error }));

function fatal(results: Settled<unknown>[]) {
  // Config/quota errors apply to every query: surface them instead of an empty board.
  const err = results.find((r) => !r.ok && r.error instanceof HttpError) as { error: HttpError } | undefined;
  if (err && results.every((r) => !r.ok)) throw err.error;
}

// Round-robin across a route's queries so one query doesn't fill the whole route.
function interleave(lists: Ref[][], taken: Set<string>, max: number): Ref[] {
  const out: Ref[] = [];
  for (let i = 0; out.length < max && lists.some((l) => i < l.length); i++) {
    for (const l of lists) {
      const r = l[i];
      if (r && !taken.has(r.id) && out.length < max) { taken.add(r.id); out.push(r); }
    }
  }
  return out;
}

async function choose(concept: string, groups: { d: Direction; cands: Ref[]; need: number }[]) {
  try {
    const picks = await curate(concept, groups.filter((g) => g.cands.length));
    return { curated: true, lists: groups.map((g) => g.cands.filter((c) => picks.has(c.id)).slice(0, g.need).map((c) => ({ ...c, ...picks.get(c.id) }))) };
  } catch (e) {
    console.error("moodlab curate failed", e);
    return { curated: false, lists: groups.map((g) => g.cands.slice(0, g.need)) };
  }
}

async function search(concept: string) {
  let directions: Direction[];
  try { directions = await planDirections(concept); }
  catch (e) { console.error("moodlab plan failed", e); throw new HttpError(502, "ai_failed", "El modelo de texto no pudo proponer direcciones ahora. Prueba de nuevo en un momento."); }

  const perDir = await Promise.all(directions.map((d) => Promise.all(d.queries.slice(0, imageProvider() === "openverse" ? 3 : 4).map((q) => settle(imageSearch(q.q, 1, q.lang))))));
  fatal(perDir.flat());
  const failed = perDir.flat().filter((r) => !r.ok).length;

  // Dedupe across routes: a photo belongs to the first route that reaches it.
  // Routes take turns so none of them claims all the shared photos.
  const ordered = perDir.map((rs) => interleave(rs.map((r) => (r.ok ? r.value : [])), new Set(), 60));
  const taken = new Set<string>();
  const cands: Ref[][] = directions.map(() => []);
  const pos = directions.map(() => 0);
  for (let round = 0; round < CANDIDATES_PER_ROUTE; round++) {
    ordered.forEach((list, i) => {
      while (pos[i] < list.length && taken.has(list[pos[i]].id)) pos[i]++;
      const r = list[pos[i]++];
      if (r) { taken.add(r.id); cands[i].push(r); }
    });
  }
  const { curated, lists: picked } = await choose(concept, directions.map((d, i) => ({ d, cands: cands[i], need: PER_ROUTE })));
  return { concept, curated, provider: imageProvider(), partial: failed > 0, directions: directions.map((d, i) => ({ ...d, refs: picked[i] })) };
}

async function more(concept: string, d: Direction, exclude: Set<string>, need: number) {
  const queries = [...d.queries];
  const fresh: Ref[] = [];
  const add = (lists: Ref[][]) => { fresh.push(...interleave(lists, exclude, CANDIDATES_PER_ROUTE - fresh.length)); };
  let failed = 0;
  for (const page of [1, 2, 3]) {
    if (fresh.length >= Math.max(need * 2, 6)) break;
    const rs = await Promise.all(queries.map((q) => settle(imageSearch(q.q, page, q.lang))));
    if (page === 1) fatal(rs);
    failed += rs.filter((r) => !r.ok).length;
    add(rs.map((r) => (r.ok ? r.value : [])));
  }
  let newQueries: typeof queries = [];
  if (fresh.length < need) {
    try {
      newQueries = await moreQueries(concept, d);
      const rs = await Promise.all(newQueries.map((q) => settle(imageSearch(q.q, 1, q.lang))));
      add(rs.map((r) => (r.ok ? r.value : [])));
    } catch (e) { console.error("moodlab more queries failed", e); }
  }
  const { curated, lists } = await choose(concept, [{ d, cands: fresh, need }]);
  return { refs: lists[0], curated, provider: imageProvider(), partial: failed > 0, queries: [...queries, ...newQueries].slice(-6) };
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let body: Record<string, any>;
  try { body = await req.json(); } catch { return Response.json({ error: "JSON no válido", code: "bad_request" }, { status: 400 }); }

  const action = String(body.action || "");
  const concept = clip(body.concept, 400);
  try {
    if (!["search", "more", "challenge"].includes(action)) throw new HttpError(400, "bad_request", "Acción no válida");
    if (concept.length < 4) throw new HttpError(400, "bad_request", "Describe tu idea con un poco más de detalle.");
    const missing = missingConfig();
    if (missing.length) throw new HttpError(503, "config", "Moodboard Lab aún no está configurado en el servidor.", { missing });
    await rateLimit(context.ip || "unknown", action as "search" | "more" | "challenge");

    if (action === "search") return Response.json(await search(concept));

    if (action === "more") {
      const d = normDirection(body.direction || {}, 0);
      if (!d.name || !d.queries.length) throw new HttpError(400, "bad_request", "Ruta no válida");
      const exclude = new Set<string>((Array.isArray(body.exclude) ? body.exclude : []).slice(0, 400).map((x: unknown) => clip(x, 30)));
      const need = Math.min(PER_ROUTE, Math.max(1, Number(body.need) || PER_ROUTE));
      return Response.json(await more(concept, d, exclude, need));
    }

    const d = { name: clip(body.direction?.name, 70), explores: clip(body.direction?.explores, 240) };
    const ref = { alt: clip(body.ref?.alt, 240), query: clip(body.ref?.query, 100), credit: clip(body.ref?.credit, 80) };
    if (!ref.alt && !ref.query) throw new HttpError(400, "bad_request", "Referencia no válida");
    try { return Response.json({ challenge: await sketchChallenge(concept, d, ref) }); }
    catch (e) { console.error("moodlab challenge failed", e); throw new HttpError(502, "ai_failed", "No se pudo escribir el reto ahora. Prueba de nuevo."); }
  } catch (e) {
    if (e instanceof HttpError) {
      const headers = e.extra.retryAfter ? { "Retry-After": String(e.extra.retryAfter) } : undefined;
      return Response.json({ error: e.message, code: e.code, ...e.extra }, { status: e.status, headers });
    }
    console.error("moodlab failed", e);
    return Response.json({ error: "Algo falló al buscar inspiración. Prueba de nuevo.", code: "error" }, { status: 500 });
  }
};

export const config: Config = { path: "/api/moodlab" };

import type { Config } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { getStore } from "@netlify/blobs";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { userData, userFiles } from "../../db/schema.js";

// Private cloud copy of each user's library. Every query is scoped to the
// authenticated Identity user, so nobody can read or change someone else's data.

// Browser storage keys that hold personal library data.
const KEYS = new Set([
  "tdl-fav", "tdl-custom", "tdl-ideas", "tdl-sketches", "tdl-concepts", "tdl-mood",
  "tdl-palettes", "tdl-materials-fav", "tdl-done", "tdl-detective", "tdl-gym-done",
  "tdl-shelf-checks-v1", "tdl-mesa", "tdl-mesa-semanas", "tdl-dudas", "tdl-dudas-fotos",
  "tdl-quests", "tdl-bio", "tdl-boards",
]);
const MAX_VALUE = 5_500_000; // characters of JSON per key
const MAX_CHUNK = 3_200_000; // bytes per PDF chunk (stays under the function payload limit)
const MAX_FILE = 36_000_000;
const FILE_ID = /^[a-z0-9-]{1,40}$/;
const UPLOAD_ID = /^[a-z0-9]{8,40}$/;

const pdfs = () => getStore({ name: "private-pdfs", consistency: "strong" });
const chunkKey = (user: string, file: string, upload: string, n: number) => `${user}/${file}/${upload}/${n}`;
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "cache-control": "no-store, private" } });

async function dropUpload(user: string, file: string, upload: string, chunks: number) {
  const store = pdfs();
  await Promise.all(Array.from({ length: chunks }, (_, n) => store.delete(chunkKey(user, file, upload, n)).catch(() => {})));
}

export default async (req: Request) => {
  const user = await getUser();
  if (!user?.id) return json({ error: "Inicia sesión para usar la nube" }, 401);
  const uid = user.id;
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/cloud\/?/, "").split("/").filter(Boolean);

  try {
    // ---------- library data ----------
    if (parts[0] === "data" && parts.length === 1) {
      if (req.method === "GET") {
        const wanted = (url.searchParams.get("keys") || "").split(",").filter((k) => KEYS.has(k));
        if (wanted.length) {
          const rows = await db.select().from(userData)
            .where(and(eq(userData.userId, uid), inArray(userData.key, wanted)));
          return json({ items: rows.map((r) => ({ key: r.key, value: r.value, updatedAt: r.updatedAt.getTime() })) });
        }
        const rows = await db.select({ key: userData.key, updatedAt: userData.updatedAt })
          .from(userData).where(eq(userData.userId, uid));
        return json({ user: { email: user.email }, items: rows.map((r) => ({ key: r.key, updatedAt: r.updatedAt.getTime() })) });
      }
      if (req.method === "PUT") {
        const body = await req.json().catch(() => null) as { items?: { key: string; value: unknown }[] } | null;
        const items = Array.isArray(body?.items) ? body!.items : [];
        if (!items.length || items.length > KEYS.size) return json({ error: "Nada que guardar" }, 400);
        const saved: { key: string; updatedAt: number }[] = [];
        for (const it of items) {
          if (!it || !KEYS.has(it.key)) return json({ error: "Clave no válida" }, 400);
          if (JSON.stringify(it.value ?? null).length > MAX_VALUE) return json({ error: "Demasiado grande", key: it.key }, 413);
          const value = it.value ?? null;
          const [row] = await db.insert(userData)
            .values({ userId: uid, key: it.key, value, updatedAt: new Date() })
            .onConflictDoUpdate({ target: [userData.userId, userData.key], set: { value, updatedAt: sql`now()` } })
            .returning({ key: userData.key, updatedAt: userData.updatedAt });
          saved.push({ key: row.key, updatedAt: row.updatedAt.getTime() });
        }
        return json({ items: saved });
      }
      return json({ error: "Método no permitido" }, 405);
    }

    // ---------- private PDFs ----------
    if (parts[0] === "files") {
      if (parts.length === 1 && req.method === "GET") {
        const rows = await db.select().from(userFiles).where(eq(userFiles.userId, uid));
        return json({ files: rows.map((r) => ({ id: r.fileId, name: r.name, size: r.size, chunks: r.chunks, upload: r.uploadId, updatedAt: r.updatedAt.getTime() })) });
      }
      const fileId = parts[1] || "";
      if (!FILE_ID.test(fileId)) return json({ error: "Archivo no válido" }, 400);

      // Upload one chunk: PUT /api/cloud/files/:id/:upload/:n
      if (parts.length === 4 && req.method === "PUT") {
        const [, , upload, nRaw] = parts;
        const n = Number(nRaw);
        if (!UPLOAD_ID.test(upload) || !Number.isInteger(n) || n < 0 || n > 20) return json({ error: "Parte no válida" }, 400);
        const bytes = await req.arrayBuffer();
        if (!bytes.byteLength || bytes.byteLength > MAX_CHUNK) return json({ error: "Parte demasiado grande" }, 413);
        await pdfs().set(chunkKey(uid, fileId, upload, n), bytes);
        return json({ ok: true });
      }
      // Download one chunk: GET /api/cloud/files/:id/:upload/:n
      if (parts.length === 4 && req.method === "GET") {
        const [, , upload, nRaw] = parts;
        const [meta] = await db.select().from(userFiles).where(and(eq(userFiles.userId, uid), eq(userFiles.fileId, fileId)));
        if (!meta || meta.uploadId !== upload) return json({ error: "No encontrado" }, 404);
        const n = Number(nRaw);
        if (!Number.isInteger(n) || n < 0 || n >= meta.chunks) return json({ error: "No encontrado" }, 404);
        const data = await pdfs().get(chunkKey(uid, fileId, upload, n), { type: "arrayBuffer" });
        if (!data) return json({ error: "No encontrado" }, 404);
        return new Response(data, { headers: { "content-type": "application/octet-stream", "cache-control": "no-store, private" } });
      }
      // Commit a finished upload: POST /api/cloud/files/:id  {upload, chunks, name, size}
      if (parts.length === 2 && req.method === "POST") {
        const b = await req.json().catch(() => null) as { upload?: string; chunks?: number; name?: string; size?: number } | null;
        const upload = String(b?.upload || "");
        const chunks = Number(b?.chunks);
        const size = Number(b?.size);
        if (!UPLOAD_ID.test(upload) || !Number.isInteger(chunks) || chunks < 1 || chunks > 20 || !(size > 0) || size > MAX_FILE) {
          return json({ error: "Datos no válidos" }, 400);
        }
        const store = pdfs();
        for (let n = 0; n < chunks; n++) {
          const m = await store.getMetadata(chunkKey(uid, fileId, upload, n));
          if (!m) return json({ error: "Falta una parte del archivo" }, 409);
        }
        const name = String(b?.name || "documento.pdf").slice(0, 200);
        const [old] = await db.select().from(userFiles).where(and(eq(userFiles.userId, uid), eq(userFiles.fileId, fileId)));
        const [row] = await db.insert(userFiles)
          .values({ userId: uid, fileId, name, size, chunks, uploadId: upload, updatedAt: new Date() })
          .onConflictDoUpdate({ target: [userFiles.userId, userFiles.fileId], set: { name, size, chunks, uploadId: upload, updatedAt: sql`now()` } })
          .returning();
        if (old && old.uploadId !== upload) await dropUpload(uid, fileId, old.uploadId, old.chunks);
        return json({ file: { id: row.fileId, name: row.name, size: row.size, chunks: row.chunks, upload: row.uploadId, updatedAt: row.updatedAt.getTime() } });
      }
      // Remove: DELETE /api/cloud/files/:id
      if (parts.length === 2 && req.method === "DELETE") {
        const [old] = await db.delete(userFiles).where(and(eq(userFiles.userId, uid), eq(userFiles.fileId, fileId))).returning();
        if (old) await dropUpload(uid, fileId, old.uploadId, old.chunks);
        return json({ ok: true });
      }
    }
    return json({ error: "No encontrado" }, 404);
  } catch (err) {
    console.error("cloud error", err);
    return json({ error: "Error del servidor" }, 500);
  }
};

export const config: Config = { path: ["/api/cloud/*"] };

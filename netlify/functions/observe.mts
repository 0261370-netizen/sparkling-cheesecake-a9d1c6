import type { Config } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { observeCache } from "../../db/schema.js";

// OBSERVE step of "¿Qué puedo crear con esto?": three questions specific to one resource.
// Generated once with AI and cached in observe_cache, keyed by the resource.

const MODEL = "claude-haiku-5-5";
const clip = (v: unknown, n: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);

type Observe = { questions: string[]; focus: string };

function fallback(kind: string, topic: string): Observe {
  return {
    focus: topic || kind,
    questions: [
      "¿Qué problema concreto resuelve este caso y para quién?",
      "¿Qué principio de forma, estructura o material lo hace funcionar?",
      "¿Cómo lo traducirías a una unión, superficie o sistema de mobiliario?",
    ],
  };
}

async function generate(input: Record<string, string>): Promise<Observe> {
  const anthropic = new Anthropic();
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 700,
    system:
      "Eres mentor de diseño industrial y de mobiliario. Escribes en español de México, claro y directo. " +
      "Tu tarea: formular exactamente tres preguntas de observación ESPECÍFICAS para el recurso dado, nunca genéricas. " +
      "Deben referirse a lo que el recurso realmente muestra (su objeto, material, organismo, proceso, lugar o idea). " +
      "Orden: 1) qué problema resuelve o qué ocurre, 2) qué principio físico, geométrico, material o de uso lo explica, " +
      "3) cómo se traduciría a una estructura, unión, superficie, proceso o pieza de mobiliario. " +
      "No inventes datos que no estén en el texto; si falta información, pregunta por ella. Máximo 30 palabras por pregunta.",
    tools: [{
      name: "observe",
      description: "Devuelve las tres preguntas de observación.",
      input_schema: {
        type: "object",
        properties: {
          focus: { type: "string", description: "En 2 a 5 palabras, el tema central que se observa." },
          questions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
        },
        required: ["focus", "questions"],
      },
    }],
    tool_choice: { type: "tool", name: "observe" },
    messages: [{
      role: "user",
      content:
        `Tipo de recurso: ${input.kind}\nTítulo: ${input.title}\nTema: ${input.topic || "—"}\n` +
        `Fuente: ${input.source || "—"}\nResumen: ${input.summary || "—"}`,
    }],
  });
  const block = msg.content.find((b) => b.type === "tool_use");
  const out = (block && "input" in block ? block.input : {}) as Partial<Observe>;
  const questions = Array.isArray(out.questions) ? out.questions.map((q) => clip(q, 260)).filter(Boolean) : [];
  if (questions.length < 3) throw new Error("Incomplete AI answer");
  return { focus: clip(out.focus, 60), questions: questions.slice(0, 3) };
}

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ error: "JSON no válido" }, { status: 400 }); }

  const input = {
    kind: clip(body.kind, 40) || "recurso",
    title: clip(body.title, 220),
    summary: clip(body.summary, 900),
    topic: clip(body.topic, 80),
    source: clip(body.source, 80),
    url: clip(body.url, 500),
  };
  if (!input.title) return Response.json({ error: "Falta el título" }, { status: 400 });

  const key = createHash("sha256").update([input.kind, input.url || "", input.title.toLowerCase()].join("|")).digest("hex");

  const [hit] = await db.select().from(observeCache).where(eq(observeCache.key, key)).limit(1);
  if (hit) return Response.json({ ...(hit.data as Observe), cached: true, ai: true });

  try {
    const data = await generate(input);
    await db.insert(observeCache).values({ key, data }).onConflictDoNothing();
    return Response.json({ ...data, cached: false, ai: true });
  } catch (e) {
    console.error("Observe generation failed", e);
    // Not cached, so the next visit tries the AI again.
    return Response.json({ ...fallback(input.kind, input.topic), cached: false, ai: false });
  }
};

export const config: Config = { path: "/api/observe" };

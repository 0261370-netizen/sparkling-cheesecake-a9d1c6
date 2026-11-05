import type { Config } from "@netlify/functions";
import { refreshNatureNews } from "../../lib/nature.js";

// Collects nature stories every morning (6:30 Mexico City, UTC-6).
export default async () => {
  const r = await refreshNatureNews();
  console.log(`Nature news: stored ${r.stored}. Ok: ${r.ok.join(", ")}. Failed: ${r.failed.join(", ") || "none"}`);
};

export const config: Config = { schedule: "30 12 * * *" };

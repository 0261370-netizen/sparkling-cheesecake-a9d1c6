import type { Config } from "@netlify/functions";
import { publishEdition } from "../../lib/publish.js";
import { mexicoNow } from "../../lib/edition.js";

// Publishes THE DESIGN DAILY every morning at 6:00 Mexico City time (UTC-6 all year).
export default async () => {
  const { date } = mexicoNow();
  const edition = await publishEdition(date);
  console.log(edition
    ? `Published edition Nº ${edition.number} (${date}) — ${edition.theme.name}. Sources ok: ${edition.sources.ok.join(", ")}; failed: ${edition.sources.failed.join(", ") || "none"}`
    : `No articles available to publish ${date}`);
};

export const config: Config = {
  schedule: "0 12 * * *",
};

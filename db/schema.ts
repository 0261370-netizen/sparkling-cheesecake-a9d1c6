import { pgTable, text, integer, jsonb, timestamp, index, primaryKey } from "drizzle-orm/pg-core";

// One row per published daily edition of THE DESIGN DAILY.
export const editions = pgTable("editions", {
  date: text().primaryKey(), // YYYY-MM-DD in America/Mexico_City
  number: integer().notNull(),
  theme: text().notNull(),
  headline: text().notNull(),
  data: jsonb().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Articles collected from publisher RSS feeds. Kept so editions survive feed outages.
export const feedItems = pgTable("feed_items", {
  link: text().primaryKey(),
  source: text().notNull(),
  topic: text().notNull().default(""),
  title: text().notNull(),
  summary: text().notNull().default(""),
  image: text().notNull().default(""),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("feed_items_published_at_idx").on(t.publishedAt.desc())]);

// Cached AI-assisted observation prompts for "¿Qué puedo crear con esto?".
export const observeCache = pgTable("observe_cache", {
  key: text().primaryKey(),
  data: jsonb().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Personal library data synced across devices. One row per user and storage key
// (notes, sketches, concept cards, favorites, palettes…). Always filtered by user_id.
export const userData = pgTable("user_data", {
  userId: text("user_id").notNull(),
  key: text().notNull(),
  value: jsonb(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.key] })]);

// Private PDFs linked to shelf books. Bytes live in Netlify Blobs, in chunks.
export const userFiles = pgTable("user_files", {
  userId: text("user_id").notNull(),
  fileId: text("file_id").notNull(),
  name: text().notNull(),
  size: integer().notNull(),
  chunks: integer().notNull(),
  uploadId: text("upload_id").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.fileId] })]);

// Nature news for "Bitácora silvestre", collected from publishers' RSS feeds.
// Kept apart from feed_items so the design newspaper never mixes in nature stories.
export const natureNews = pgTable("nature_news", {
  link: text().primaryKey(),
  source: text().notNull(),
  lang: text().notNull().default("en"),
  topic: text().notNull().default(""),
  title: text().notNull(),
  summary: text().notNull().default(""),
  image: text().notNull().default(""),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("nature_news_published_at_idx").on(t.publishedAt.desc())]);

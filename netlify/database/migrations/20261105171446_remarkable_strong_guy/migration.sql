ALTER TABLE "feed_items" ADD COLUMN "image" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX "feed_items_published_at_idx" ON "feed_items" ("published_at" DESC NULLS LAST);
CREATE TABLE "nature_news" (
	"link" text PRIMARY KEY,
	"source" text NOT NULL,
	"lang" text DEFAULT 'en' NOT NULL,
	"topic" text DEFAULT '' NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "nature_news_published_at_idx" ON "nature_news" ("published_at" DESC NULLS LAST);
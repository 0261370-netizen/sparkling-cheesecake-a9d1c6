CREATE TABLE "editions" (
	"date" text PRIMARY KEY,
	"number" integer NOT NULL,
	"theme" text NOT NULL,
	"headline" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_items" (
	"link" text PRIMARY KEY,
	"source" text NOT NULL,
	"topic" text DEFAULT '' NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "observe_cache" (
	"key" text PRIMARY KEY,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user_data" (
	"user_id" text,
	"key" text,
	"value" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_data_pkey" PRIMARY KEY("user_id","key")
);
--> statement-breakpoint
CREATE TABLE "user_files" (
	"user_id" text,
	"file_id" text,
	"name" text NOT NULL,
	"size" integer NOT NULL,
	"chunks" integer NOT NULL,
	"upload_id" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_files_pkey" PRIMARY KEY("user_id","file_id")
);

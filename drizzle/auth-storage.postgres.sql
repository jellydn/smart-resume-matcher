-- Existing PostgreSQL installations only. Apply once with psql --single-transaction
-- and ON_ERROR_STOP=1. See doc/auth-rollout.md before applying this migration.
ALTER TABLE "accounts" ADD COLUMN "password" text;
ALTER TABLE "sessions" ADD COLUMN "ip_address" text;
ALTER TABLE "sessions" ADD COLUMN "user_agent" text;

CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");

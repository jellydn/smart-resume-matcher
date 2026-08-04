import { z } from "zod";

const envSchema = z.object({
	DATABASE_TYPE: z.enum(["sqlite", "postgres"]).default("sqlite"),
	DATABASE_PATH: z.string().default("./data/sqlite.db"),
	DATABASE_URL: z.string().optional(),
});

const parsed = envSchema.parse(process.env);

// Derived values - no magic strings after validation
export const isPostgres =
	parsed.DATABASE_TYPE === "postgres" && !!parsed.DATABASE_URL;

export const env = {
	get databaseType(): "sqlite" | "postgres" {
		return parsed.DATABASE_TYPE;
	},
	get databasePath(): string {
		return parsed.DATABASE_PATH;
	},
	get databaseUrl(): string | undefined {
		return parsed.DATABASE_URL;
	},
};

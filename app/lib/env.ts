import { z } from "zod";

const envSchema = z.object({
	DATABASE_TYPE: z.enum(["sqlite", "postgres"]).default("sqlite"),
	DATABASE_PATH: z.string().default("./data/sqlite.db"),
	DATABASE_URL: z.string().optional(),
});

const parsed = envSchema.parse(process.env);

// Derived values - no magic strings after validation
export const isPostgres = parsed.DATABASE_TYPE === "postgres";

export function requireDatabaseUrl(): string {
	if (!parsed.DATABASE_URL) {
		throw new Error(
			"DATABASE_URL is required when DATABASE_TYPE is 'postgres'",
		);
	}
	return parsed.DATABASE_URL;
}

export const env = {
	get databasePath(): string {
		return parsed.DATABASE_PATH;
	},
};

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env, isPostgres } from "~/lib/env";
import * as schema from "./schema";

let db:
	| ReturnType<typeof drizzle<typeof schema>>
	| ReturnType<typeof drizzlePostgres<typeof schema>>;

if (isPostgres) {
	const url = env.databaseUrl;
	if (url) {
		const client = postgres(url);
		db = drizzlePostgres(client, { schema });
	} else {
		throw new Error(
			"DATABASE_URL is required when DATABASE_TYPE is 'postgres'",
		);
	}
} else {
	const sqlite = new Database(env.databasePath);
	db = drizzle(sqlite, { schema });
}

export const dbExport = db as ReturnType<typeof drizzle<typeof schema>>;

export { dbExport as db };

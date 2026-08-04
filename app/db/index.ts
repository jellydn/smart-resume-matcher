import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/lib/env";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>>;

if (env.databaseType === "postgres") {
	const url = env.databaseUrl;
	if (!url) {
		throw new Error(
			"DATABASE_URL is required when DATABASE_TYPE is 'postgres'",
		);
	}
	const client = postgres(url);
	db = drizzlePostgres(client, { schema }) as unknown as typeof db;
} else {
	const sqlite = new Database(env.databasePath);
	db = drizzle(sqlite, { schema });
}

export { db };

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env, isPostgres, requireDatabaseUrl } from "~/lib/env";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>>;

if (isPostgres) {
	const client = postgres(requireDatabaseUrl());
	db = drizzlePostgres(client, { schema }) as unknown as typeof db;
} else {
	const sqlite = new Database(env.databasePath);
	db = drizzle(sqlite, { schema });
}

export { db };

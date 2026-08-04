import { defineConfig } from "drizzle-kit";
import { env, isPostgres, requireDatabaseUrl } from "./app/lib/env";

const baseConfig = {
	schema: "./app/db/schema/index.ts",
};

const postgresUrl = isPostgres ? requireDatabaseUrl() : undefined;

const postgresConfig = defineConfig({
	...baseConfig,
	dialect: "postgresql",
	dbCredentials: {
		url: postgresUrl ?? "",
	},
	out: "./drizzle/postgres",
});

const sqliteConfig = defineConfig({
	...baseConfig,
	dialect: "sqlite",
	dbCredentials: {
		url: env.databasePath,
	},
	out: "./drizzle/sqlite",
});

export default isPostgres ? postgresConfig : sqliteConfig;

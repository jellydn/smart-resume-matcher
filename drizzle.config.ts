import { defineConfig } from "drizzle-kit";
import { env } from "./app/lib/env";

const baseConfig = {
	schema: "./app/db/schema/index.ts",
};

const postgresConfig = defineConfig({
	...baseConfig,
	dialect: "postgresql",
	dbCredentials: {
		url: env.databaseUrl || "",
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

export default env.databaseType === "postgres" ? postgresConfig : sqliteConfig;

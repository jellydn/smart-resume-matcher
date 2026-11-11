import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/db";
import { isPostgres } from "~/lib/env";

export const auth = betterAuth({
	baseURL: process.env.APP_URL,
	database: drizzleAdapter(db, {
		provider: isPostgres ? "pg" : "sqlite",
		usePlural: true,
	}),
	advanced: {
		database: { generateId: "uuid" },
	},
	account: {
		fields: {
			providerId: "provider",
			accountId: "providerAccountId",
		},
	},
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // Update session every 24 hours
	},
	trustedOrigins: process.env.AUTH_TRUSTED_ORIGINS
		? process.env.AUTH_TRUSTED_ORIGINS.split(",")
				.map((o) => o.trim().replace(/\/+$/, ""))
				.filter(Boolean)
		: [
				process.env.APP_URL
					? process.env.APP_URL.trim().replace(/\/+$/, "")
					: "http://localhost:5173",
			],
});

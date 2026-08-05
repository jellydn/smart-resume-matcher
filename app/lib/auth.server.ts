import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/db";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // Update session every 24 hours
	},
	trustedOrigins: process.env.AUTH_TRUSTED_ORIGINS
		? process.env.AUTH_TRUSTED_ORIGINS.split(",").map((o) => o.trim())
		: [process.env.APP_URL || "http://localhost:5173"],
});

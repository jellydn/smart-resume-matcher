import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { RouterContextProvider } from "react-router";
import { afterAll, beforeAll, expect, it, vi } from "vitest";

const directory = mkdtempSync(join(tmpdir(), "resume-auth-"));
const path = join(directory, "auth.db");
const origin = "http://localhost:5173";
let auth: typeof import("./auth.server").auth;
let client: Database.Database;

beforeAll(async () => {
	vi.stubEnv("DATABASE_TYPE", "sqlite");
	vi.stubEnv("DATABASE_PATH", path);
	vi.stubEnv("APP_URL", origin);
	vi.stubEnv("AUTH_TRUSTED_ORIGINS", origin);
	vi.stubEnv(
		"BETTER_AUTH_SECRET",
		"isolated-test-secret-with-at-least-32-characters",
	);
	client = new Database(path);
	const baseline = join(directory, "baseline");
	mkdirSync(join(baseline, "meta"), { recursive: true });
	const journal = JSON.parse(
		readFileSync("drizzle/meta/_journal.json", "utf8"),
	);
	writeFileSync(
		join(baseline, "meta/_journal.json"),
		JSON.stringify({ ...journal, entries: journal.entries.slice(0, 1) }),
	);
	copyFileSync(
		"drizzle/0000_cool_madelyne_pryor.sql",
		join(baseline, "0000_cool_madelyne_pryor.sql"),
	);
	migrate(drizzle(client), { migrationsFolder: baseline });
	client.exec(`
		INSERT INTO users (id, email, name, created_at, updated_at)
		VALUES ('legacy-user', 'legacy@example.test', 'Legacy User', 1700000000, 1700000000);
		INSERT INTO accounts (id, user_id, provider, provider_account_id, created_at, updated_at)
		VALUES ('legacy-account', 'legacy-user', 'github', 'provider-123', 1700000000, 1700000000);
		INSERT INTO sessions (id, user_id, token, expires_at, created_at, updated_at)
		VALUES ('legacy-session', 'legacy-user', 'legacy-token', 4102444800, 1700000000, 1700000000);
		INSERT INTO user_resumes (id, user_id, resume_data, created_at, updated_at)
		VALUES ('legacy-resume', 'legacy-user', '{"personalInfo":{"name":"Legacy User","email":"legacy@example.test"}}', 1700000000, 1700000000);
	`);
	migrate(drizzle(client), { migrationsFolder: "drizzle" });
	({ auth } = await import("./auth.server"));
});

afterAll(async () => {
	const { db } = await import("~/db");
	db.$client.close();
	client.close();
	vi.unstubAllEnvs();
	rmSync(directory, { recursive: true, force: true });
});

function request(endpoint: string, body?: object, cookie?: string) {
	return auth.handler(
		new Request(`${origin}/api/auth/${endpoint}`, {
			method: body ? "POST" : "GET",
			headers: {
				"Content-Type": "application/json",
				Origin: origin,
				...(cookie ? { Cookie: cookie } : {}),
			},
			body: body ? JSON.stringify(body) : undefined,
		}),
	);
}

it("adds auth storage without changing existing records and can migrate again", () => {
	migrate(drizzle(client), { migrationsFolder: "drizzle" });
	expect(
		client
			.prepare("SELECT id, email FROM users WHERE id = ?")
			.get("legacy-user"),
	).toEqual({ id: "legacy-user", email: "legacy@example.test" });
	expect(
		client
			.prepare(
				"SELECT provider, provider_account_id, password FROM accounts WHERE id = ?",
			)
			.get("legacy-account"),
	).toEqual({
		provider: "github",
		provider_account_id: "provider-123",
		password: null,
	});
	expect(
		client
			.prepare(
				"SELECT token, ip_address, user_agent FROM sessions WHERE id = ?",
			)
			.get("legacy-session"),
	).toEqual({ token: "legacy-token", ip_address: null, user_agent: null });
	expect(
		client
			.prepare("SELECT resume_data FROM user_resumes WHERE id = ?")
			.get("legacy-resume"),
	).toEqual({
		resume_data:
			'{"personalInfo":{"name":"Legacy User","email":"legacy@example.test"}}',
	});
});

it("registers, authenticates, persists a session, and revokes it on logout", async () => {
	const credentials = {
		email: "auth-lifecycle@example.test",
		password: "test-only-password-123",
	};
	const signup = await request("sign-up/email", {
		name: "Lifecycle Test",
		...credentials,
	});
	expect(signup.status).toBe(200);
	const user = (await signup.json()).user;
	expect(user.email).toBe(credentials.email);

	const wrong = await request("sign-in/email", {
		...credentials,
		password: "wrong-password-456",
	});
	expect(wrong.status).toBe(401);

	const login = await request("sign-in/email", credentials);
	expect(login.status).toBe(200);
	const cookie = login.headers
		.getSetCookie()
		.map((c) => c.split(";")[0])
		.join("; ");
	expect(cookie).not.toBe("");
	const session = await request("get-session", undefined, cookie);
	expect((await session.json()).user.id).toBe(user.id);

	const logout = await request("sign-out", {}, cookie);
	expect(logout.status).toBe(200);
	const revoked = await request("get-session", undefined, cookie);
	expect(await revoked.json()).toBeNull();
});

it("denies anonymous access and keeps two users' saved resumes isolated", async () => {
	const { loader, action } = await import("~/routes/api.resume");
	const cookies: string[] = [];
	for (const name of ["Alice", "Bob"]) {
		const response = await request("sign-up/email", {
			name,
			email: `${name.toLowerCase()}@example.test`,
			password: "test-only-password-123",
		});
		expect(response.status).toBe(200);
		cookies.push(
			response.headers
				.getSetCookie()
				.map((c) => c.split(";")[0])
				.join("; "),
		);
	}
	const read = (cookie = "") =>
		loader({
			request: new Request(`${origin}/api/resume`, {
				headers: { Cookie: cookie },
			}),
			url: new URL(`${origin}/api/resume`),
			pattern: "/api/resume",
			params: {},
			context: new RouterContextProvider(),
		});
	const write = (cookie: string, name: string) =>
		action({
			request: new Request(`${origin}/api/resume`, {
				method: "POST",
				headers: { Cookie: cookie, "Content-Type": "application/json" },
				body: JSON.stringify({
					resume: { personalInfo: { name, email: "resume@example.test" } },
				}),
			}),
			url: new URL(`${origin}/api/resume`),
			pattern: "/api/resume",
			params: {},
			context: new RouterContextProvider(),
		});
	expect((await read()).status).toBe(401);
	expect((await write("", "Anonymous")).status).toBe(401);
	expect((await write(cookies[0], "Alice Private Resume")).status).toBe(200);
	expect((await (await read(cookies[1])).json()).resume).toBeNull();
	expect((await write(cookies[1], "Bob Private Resume")).status).toBe(200);
	expect((await write(cookies[0], "Alice Updated Resume")).status).toBe(200);
	expect((await (await read(cookies[0])).json()).resume.personalInfo.name).toBe(
		"Alice Updated Resume",
	);
	expect((await (await read(cookies[1])).json()).resume.personalInfo.name).toBe(
		"Bob Private Resume",
	);
});

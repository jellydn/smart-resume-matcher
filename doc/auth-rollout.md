# Authentication storage repair

## Scope and release order

This change maps Better Auth to the existing `users`, `sessions`, and `accounts`
tables. `providerId` maps to `provider`; `accountId` maps to `providerAccountId`.
New IDs use UUIDs, as required by the existing PostgreSQL schema. Existing IDs,
tokens, provider IDs, and resume data are not changed.

The migrations add nullable `accounts.password`, `sessions.ip_address`, and
`sessions.user_agent` columns, plus a `verifications` table and identifier index.
There are no drops, renames, data rewrites, or changes to existing constraints.
The password column stores Better Auth password hashes, never plaintext.

Apply the schema change **before** starting the repaired application. The old
application tolerates the added storage. The new application cannot run against
the old schema. Merging this PR is not approval to migrate or deploy production.

**Merge gate:** `.github/workflows/deploy-dokku.yml` deploys every push to `main`.
Do not merge this change until the maintainer has confirmed that the target
database is migrated and has approved the resulting rollout, or has separately
approved a way to hold deployment. Do not disable that workflow without approval.

## Owner and preflight

The deployment maintainer owns the database target, backup, maintenance window,
release, and rollback decision. No production target is assumed here.

1. Confirm the target engine, database, application version, and migration history.
   Rehearse on an isolated copy, not the live database.
2. Stop writes during the migration window. Take a consistent backup using the
   SQLite backup API or `pg_dump`, and verify that the backup can be restored.
   Do not copy a live SQLite file without its WAL state.
3. Check that the three new columns and `verifications` table do not already
   exist. If any exist, stop and compare the schema; do not ignore errors or
   rerun the SQL blindly. Check existing row counts and representative resume,
   account, and session values for comparison after migration.
4. Set a persistent, private `BETTER_AUTH_SECRET`, the canonical HTTPS `APP_URL`,
   and the exact permitted `AUTH_TRUSTED_ORIGINS`. Keep the same secret across
   instances and restarts. Do not rotate it as part of this repair.
5. Check whether legacy credential accounts have password hashes stored outside
   this schema. The migration cannot recover hashes that were never stored.
   Do not invent passwords or overwrite accounts. Agree on a separate secure
   recovery process for affected accounts before releasing sign-in to them.

## SQLite

The existing baseline and journal are in `drizzle/`. The config now uses that
directory, rather than the previously unused `drizzle/sqlite/` path.

For a **new, empty local database**, create its parent directory, set
`DATABASE_PATH`, then run:

```bash
pnpm db:migrate:sqlite
```

For an **existing database with the initial migration recorded** in
`__drizzle_migrations`, the same command applies only `0001_auth_storage.sql`.
The runner records the migration and a later run is a no-op.

For an **existing database created by `db:push` without migration history**, do
not run the initial migration over its tables. After backup and schema review,
apply only the additive SQL in one transaction with the SQLite CLI:

```bash
sqlite3 -bail "$DATABASE_PATH" <<'SQL'
PRAGMA foreign_keys = ON;
BEGIN IMMEDIATE;
.read drizzle/0001_auth_storage.sql
COMMIT;
SQL
```

This manual path does not create a migration-history entry. Do not later switch
that database to `db:migrate` without a separately reviewed baseline procedure.
Never use `db:push --force` as a production migration substitute.

## PostgreSQL

There is no tracked PostgreSQL baseline/journal in this repository. Do not run
the SQLite migrations or create a new full-schema migration over existing tables.
For an **existing PostgreSQL database** with the previous application tables,
apply the reviewed additive SQL once:

```bash
psql "$DATABASE_URL" --set ON_ERROR_STOP=1 --single-transaction \
  --file drizzle/auth-storage.postgres.sql
```

The command rolls back the whole transaction on an error. A repeated run fails
on the existing columns; it must not be treated as a successful migration. Record
the applied SQL checksum and release in the maintainer's deployment record.

For a **new disposable development PostgreSQL database only**, the current schema
can be initialized with `pnpm db:push:postgres`. Do not use this command to upgrade
an existing shared database.

## Verification and rollout gate

Before release, compare the preserved rows and run integrity/foreign-key checks.
Test the following on the migrated copy, then on the approved staging target:

- Sign up two distinct users. Confirm UUID IDs on PostgreSQL.
- Reject a wrong password; accept the correct password.
- Retain the authenticated session after another request and an app restart.
- Save a different resume for each user. Update one and confirm the other is
  unchanged. Anonymous reads and writes must return 401.
- Log out. Replaying the old cookie must not restore the session or resume access.
- Reject an untrusted auth origin without signing the user out.

Run `pnpm run typecheck`, `pnpm run lint`, `pnpm test:coverage`,
`pnpm run build`, and `pnpm audit --audit-level=high` on Node 24. Keep all branch
protections and security checks enabled. The PDF.js Socket warning is a separate
gate; this repair does not accept it. Retain the existing Renovate delay policy.

Release only after the maintainer approves the staging evidence and migration
window. Monitor auth 5xx responses, failed sign-ins, session lookup failures, and
resume-sync failures. Stop rollout if these checks regress or any cross-user
access occurs.

## Rollback limits

Prefer rolling back the application while leaving the additive columns and table
in place. Do not drop the new storage: it may contain new hashes and verification
records. Reverting to a vulnerable or previously broken auth version is not a
safe long-term fallback; stop auth traffic while investigating if required.

A backup restore would lose writes made after the backup and needs separate
maintainer approval. No destructive down migration or production execution is
authorized by this document.

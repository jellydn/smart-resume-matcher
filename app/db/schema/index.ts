import { isPostgres } from "~/lib/env";
import * as postgresSchema from "./postgres";
// Database-specific schema imports
import * as sqliteSchema from "./sqlite";

// Select the appropriate schema based on environment
const selectedSchema = isPostgres ? postgresSchema : sqliteSchema;

// Re-export all schema objects and types for backward compatibility
export const users = selectedSchema.users;
export const sessions = selectedSchema.sessions;
export const accounts = selectedSchema.accounts;
export const userResumes = selectedSchema.userResumes;

// Types - both schemas have identical structure; prefer sqlite types
// for consistency with the unified db export
export type User = sqliteSchema.User;
export type NewUser = sqliteSchema.NewUser;
export type Session = sqliteSchema.Session;
export type NewSession = sqliteSchema.NewSession;
export type Account = sqliteSchema.Account;
export type NewAccount = sqliteSchema.NewAccount;
export type UserResume = sqliteSchema.UserResume;
export type NewUserResume = sqliteSchema.NewUserResume;

CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verifications_identifier_idx` ON `verifications` (`identifier`);--> statement-breakpoint
ALTER TABLE `accounts` ADD `password` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `ip_address` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `user_agent` text;
CREATE TABLE `news` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text(256) NOT NULL,
	`description` text(512) NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`markdown` text NOT NULL
);

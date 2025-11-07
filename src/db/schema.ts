import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const newsTable = sqliteTable('news', {
	id: int().primaryKey({ autoIncrement: true }),
	title: text({ length: 256 }).notNull(),
	description: text({ length: 512 }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
	markdown: text().notNull(),
});
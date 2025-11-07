import { getDBFilename } from "@config";
import { newsTable } from "./schema";
import { desc, eq } from "drizzle-orm";
import { marked } from "marked";
import { drizzle } from 'drizzle-orm/libsql';

export * from './types'

const db = drizzle(getDBFilename());

export const createNews = async (
	data: Omit<typeof newsTable.$inferInsert, 'updatedAt' | 'createdAt'>,
) => {
	const list = await db.insert(newsTable).values({
		...data,
		updatedAt: new Date().toISOString(),
		createdAt: new Date().toISOString(),
	}).returning();
	return list[0];
}

export const updateNews = async (
	id: number,
	data: Partial<Omit<typeof newsTable.$inferInsert, 'createdAt' | 'updatedAt' | 'id'>>,
) => {
	const list = await db.update(newsTable)
		.set({
			...data,
			updatedAt: new Date().toISOString(),
		})
		.where(eq(newsTable.id, id))
		.returning();
	return list[0];
}

export const deleteNews = async (
	id: number,
) => {
	await db.delete(newsTable).where(eq(newsTable.id, id));
}

export const getManyNews = async ({
	limit,
	offset,
	markdown,
	html,
}: {
	offset: number,
	limit: number,
	markdown: boolean,
	html: boolean,
}) => {
	if(html) {
		markdown = true;
	}

	const list = await db.select({
		id: newsTable.id,
		title: newsTable.title,
		description: newsTable.description,
		createdAt: newsTable.createdAt,
		updatedAt: newsTable.updatedAt,
		...(markdown && { markdown: newsTable.markdown }),
	}).from(newsTable).limit(limit).offset(offset).orderBy(desc(newsTable.id));

	if(html) {
		return Promise.all(
			list.map(async item => ({
				...item,
				html: await marked.parse(item.markdown!),
			}))
		);
	} else {
		return list;
	}
}

export const getNewsMarkdown = async (
	id: number,
) => {
	const list = await db.select({
		markdown: newsTable.markdown,
	}).from(newsTable).where(eq(newsTable.id, id));
	return list.at(0)?.markdown;
}

export const getNews = async (
	id: number,
	{
		markdown,
	}: {
		markdown: boolean
	} = {
		markdown: false,
	}
) => {
	const list = await db.select({
		id: newsTable.id,
		title: newsTable.title,
		description: newsTable.description,
		createdAt: newsTable.createdAt,
		updatedAt: newsTable.updatedAt,
		...(markdown && { markdown: newsTable.markdown }),
	}).from(newsTable).where(eq(newsTable.id, id));
	return list.at(0);
}
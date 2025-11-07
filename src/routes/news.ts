import { createNews, deleteNews, getManyNews, getNewsMarkdown, updateNews, getNews, News, ConnectionInfo } from "@db";
import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../authMiddleware";
import { HTTPException } from 'hono/http-exception'
import { maxNewsPerRequest } from "../const";
import { marked } from "marked";
import { events } from "../events";
import { SSEMessage, SSEStreamingApi } from 'hono/streaming'
import { sse } from "../sse";
import { getConnInfo } from 'hono/bun';
import { countIpsFromConnections } from "../utils";

export const news = new Hono();

const getListSchema = z.object({
	limit: z.number({ coerce: true }).int().max(maxNewsPerRequest),
	offset: z.number({ coerce: true }).int().default(0),
	markdown: z.enum(['false', 'true']).default('false'),
	html: z.enum(['false', 'true']).default('false'),
});

news.get('/', zValidator('query', getListSchema), async c => {
	const query = c.req.valid('query');
	const list = await getManyNews({
		...query,
		markdown: query.markdown === 'true',
		html: query.html === 'true',
	});
	return c.json(list);
});

const idParamSchema = z.object({
	id: z.coerce.number().int(),
});
const idParamValidator = zValidator('param', idParamSchema);

const getArticleSearchParamsValidator = zValidator('query', z.object({
	markdown: z.enum(['false', 'true']).default('false'),
}));

const sseConnections: ConnectionInfo[] = [];
news.get('/updates', c => {
	const conn: ConnectionInfo = {
		c,
		ip: c.req.header('X-Real-Ip') ?? getConnInfo(c).remote.address,
	}
	sseConnections.push(conn);

  const { readable, writable } = new TransformStream();
	const stream = new SSEStreamingApi(writable, readable);

	c.header('Content-Type', 'text/event-stream');
	c.header('Cache-Control', 'no-cache');
	c.header('Connection', 'keep-alive');

	const forwardMessage = (msg: SSEMessage) => stream.writeSSE(msg);
	sse.on('create-news', forwardMessage);
	sse.on('update-news', forwardMessage);
	sse.on('delete-news', forwardMessage);
	sse.on('update-online', forwardMessage);
	const interval = setInterval(() => stream.writeSSE({ data: 'ping' }), 5e3);

	stream.onAbort(() => {
		const connIndex = sseConnections.indexOf(conn);
		if(connIndex !== -1) {
			sseConnections.splice(connIndex, 1);
		}
		
		sse.off('create-news', forwardMessage);
		sse.off('update-news', forwardMessage);
		sse.off('delete-news', forwardMessage);
		sse.off('update-online', forwardMessage);
		clearInterval(interval);

		events.emit('update-online', countIpsFromConnections(sseConnections));
	});

	events.emit('update-online', countIpsFromConnections(sseConnections));

	return c.newResponse(stream.responseReadable);
});

news.get('/:id', idParamValidator, getArticleSearchParamsValidator, async c => {
	const { id } = c.req.valid('param');
	const { markdown } = c.req.valid('query');
	const news = await getNews(id, { markdown: markdown === 'true' });
	return c.json(news);
});

news.get('/markdown/:id', idParamValidator, async c => {
	const { id } = c.req.valid('param');
	const markdown = await getNewsMarkdown(id);
	if(markdown === undefined) {
		throw new HTTPException(404);
	}

	return c.text(markdown);
});

news.get('/html/:id', idParamValidator, async c => {
	const { id } = c.req.valid('param');
	const markdown = await getNewsMarkdown(id);
	if(markdown === undefined) {
		throw new HTTPException(404);
	}

	const html = await marked.parse(markdown);
	return c.text(html);
});

const createSchema = z.object({
	title: z.string(),
	description: z.string(),
	markdown: z.string(),
});

news.post('/', authMiddleware, zValidator('json', createSchema), async c => {
	const body = c.req.valid('json');
	const created = await createNews(body);
	events.emit('create-news', created);
	return c.json(created, 201);
});

const updateSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	markdown: z.string().optional(),
});

news.post('/:id', authMiddleware, idParamValidator, zValidator('json', updateSchema), async c => {
	const body = c.req.valid('json');
	const { id } = c.req.valid('param');
	await updateNews(id, body);
	const updated = await getNews(id, { markdown: true }) as News;
	events.emit('update-news', updated);
	return c.json(updated);
});

news.delete('/:id', authMiddleware, idParamValidator, async c => {
	const { id } = c.req.valid('param');
	await deleteNews(id);
	events.emit('delete-news', id);
	return c.body(null, 200);
});
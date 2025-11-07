import { EventEmitter } from "events";
import { events } from "./events";
import { SSEMessage } from "hono/streaming";
import uniqid = require('uniqid');
import { marked } from "marked";

export type SSEEventMap = {
	'create-news': [SSEMessage],
	'update-news': [SSEMessage],
	'delete-news': [SSEMessage],
	'update-online': [SSEMessage],
}

export const sse = new EventEmitter<SSEEventMap>();

events.on('create-news', async data => {
	sse.emit('create-news', {
		id: uniqid(),
		data: JSON.stringify({
			id: data.id,
			title: data.title,
			description: data.description,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
			html: await marked(data.markdown),
		}),
		event: 'create-news',
	});
});

events.on('update-news', async data => {
	sse.emit('update-news', {
		id: uniqid(),
		data: JSON.stringify({
			id: data.id,
			title: data.title,
			description: data.description,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
			html: await marked(data.markdown),
		}),
		event: 'update-news',
	});
});

events.on('delete-news', data => {
	sse.emit('delete-news', {
		id: uniqid(),
		data: data.toString(),
		event: 'delete-news',
	});
});

events.on('update-online', data => {
	sse.emit('update-online', {
		id: uniqid(),
		data: JSON.stringify(data),
		event: 'update-online',
	});
});
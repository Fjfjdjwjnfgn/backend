import { News } from "@db";
import { EventEmitter } from "events";

export type EventMap = {
	'create-news': [News],
	'update-news': [News],
	'delete-news': [number],
	'update-online': [{ ips: number }],
}

export const events = new EventEmitter<EventMap>();
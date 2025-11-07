import { Hono } from "hono";

export const ping = new Hono();

ping.get('/', c => c.text('pong'));
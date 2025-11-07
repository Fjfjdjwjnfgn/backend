import { Context } from "hono";
import { newsTable } from "./schema";

export type News = typeof newsTable.$inferSelect;

export interface ConnectionInfo {
	c: Context;
	ip?: string;
}
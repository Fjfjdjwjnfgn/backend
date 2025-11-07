import { getBasePath, getPort } from "@config";
import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { ping } from "./routes/ping";
import { news } from "./routes/news";
import { auth } from "./routes/auth";

const app = new Hono().basePath(getBasePath());

app.use('*', cors({
	origin: '*',
	allowMethods: [
		'GET',
		'POST',
		'OPTIONS',
		'DELETE',
	],
	allowHeaders: [
		'Content-Type',
		'Authorization',
	],
	credentials: true,
}));

app.route('/ping', ping);
app.route('/news', news);
app.route('/auth', auth);

serve({
	fetch: app.fetch,
	port: getPort(),
});

console.log(`server started on ${getPort()} port`);
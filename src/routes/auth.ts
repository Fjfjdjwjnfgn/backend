import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { checkCredentials } from "../utils";
import { setCookie } from "hono/cookie";

export const auth = new Hono();

const checkValidator = zValidator('json', z.object({
	username: z.string(),
	password: z.string(),
}));

auth.post('/login', checkValidator, c => {
	const body = c.req.valid('json');
	const success = checkCredentials(body);
	if(success) setCookie(c, 'auth', btoa(body.username + ':' + body.password), {
		sameSite: 'None',
		secure: true,
	});
	return c.json({ success });
});
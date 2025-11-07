import { getAuthName, getAuthPassword } from '@config';
import { basicAuth } from 'hono/basic-auth'

export const authMiddleware = basicAuth({
	username: getAuthName(),
	password: getAuthPassword(),
});
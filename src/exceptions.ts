import { HTTPException } from "hono/http-exception";

export class UnauthorizedException extends HTTPException {
	constructor() {
		super(401);
	}
}
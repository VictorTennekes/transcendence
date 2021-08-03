import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

Injectable()
export class LoginGuard extends AuthGuard('42')
{
	constructor() { super(); }

	async canActivate(context: ExecutionContext) {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest();
		const result = (await super.canActivate(context)) as boolean;
		if (result)
			super.logIn(request);
		return (result);
	}
}

import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

//This registers session data in the database using SerializeUser, is fetched with DeserializeUser
Injectable()
export class LoginGuard extends AuthGuard('42')
{
	constructor() {
		super();
	}

	async canActivate(context: ExecutionContext) {
		const result = (await super.canActivate(context)) as boolean;
		const ctx = context.switchToHttp();
		const request = ctx.getRequest();
		if (result)
			super.logIn(request);
//		console.table(request.session);
		return (result);
	}
}

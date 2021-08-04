import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

//This registers session data in the database using SerializeUser, is fetched with DeserializeUser
Injectable()
export class LoginGuard extends AuthGuard('42')
{
	constructor() {
		super();
	}

	async canActivate(context: ExecutionContext) {
		console.log("LoginGuard");
		const ctx = context.switchToHttp();
		const request = ctx.getRequest();
		const result = (await super.canActivate(context)) as boolean;
		console.log("right before super.logIn()");
		if (result)
			super.logIn(request);
		console.log("end of LoginGuard");
		return (result);
	}
}

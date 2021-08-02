import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class LoginGuard extends AuthGuard('42') {
	constructor() {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {

		const parentCanActivate = (await super.canActivate(context)) as boolean;
		return parentCanActivate;
	}
}

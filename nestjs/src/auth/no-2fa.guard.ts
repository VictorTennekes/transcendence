import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export class No2FAGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> {
		const httpContext = context.switchToHttp();
		const request = httpContext.getRequest();
		const response = httpContext.getResponse();
		if (!request.isAuthenticated())
			throw new UnauthorizedException();
		if (!request.session?.passport?.user)
			throw new UnauthorizedException();
		return (true);
	}
}

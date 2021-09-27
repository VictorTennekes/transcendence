import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

//Check if the request is authenticated and user data is present on the request
@Injectable()
export class AuthenticatedGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> {
		const httpContext = context.switchToHttp();
		const request = httpContext.getRequest();
		
		if (!request.isAuthenticated())
			throw new UnauthorizedException(undefined, 'Request is not authenticated!');
		if (!request?.session?.passport?.user?.login)
			throw new UnauthorizedException(undefined, 'No session found.');
		if (request?.session?.passport?.two_factor_enabled && !request?.session?.two_factor)
			throw new UnauthorizedException(undefined, '2FA enabled but not passed.');
		return true;
	}
}

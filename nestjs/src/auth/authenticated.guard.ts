import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

//Check if the request is authenticated and user data is present on the request
@Injectable()
export class AuthenticatedGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> {
		const httpContext = context.switchToHttp();
		const request = httpContext.getRequest();
		return request.isAuthenticated() && request.session.passport.user.intra_name;
	}
}

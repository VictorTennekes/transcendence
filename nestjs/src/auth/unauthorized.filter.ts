import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Response } from "express";

//This triggers on the types of Exceptions specified in the @Catch decorator
//if supplied in the @UseFilters() decorator of a route
@Catch(UnauthorizedException, ForbiddenException)
export class UnauthorizedFilter implements ExceptionFilter {
	constructor() {}

	catch(
		_exception: ForbiddenException | UnauthorizedException,
		host: ArgumentsHost
	) {
		console.log(_exception instanceof ForbiddenException ? `@Forbidden` : `@Unauthorized`, " | ", _exception.message);
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		if (_exception.message === '2FA enabled but not passed.') {
			response.redirect('/2fa/authenticate');
		}
		response.redirect('http://localhost:4200/');
	}
}

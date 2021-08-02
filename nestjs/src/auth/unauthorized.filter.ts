import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Response } from "express";
import { FortyTwoStrategy } from "./42auth.strategy";

@Catch(UnauthorizedException, ForbiddenException)
export class UnauthorizedFilter implements ExceptionFilter {
	constructor(
		private readonly strategy: FortyTwoStrategy
	) {}

	catch(
		_exception: ForbiddenException | UnauthorizedException,
		host: ArgumentsHost
	) {
		console.log(_exception instanceof ForbiddenException ? `@Forbidden` : `@Unauthorized`);
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		response.redirect(this.strategy.failureRedirect);
	}
}

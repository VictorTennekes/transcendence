import { Controller, Get, Logger, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FortyTwoStrategy } from './42auth.strategy';
import { LoginGuard } from './login.guard';
import { UnauthorizedFilter } from './unauthorized.filter';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly strategy: FortyTwoStrategy
	) {}

	@Get('redirect')
	@UseGuards(LoginGuard)
	@UseFilters(UnauthorizedFilter)
	async login(@Req() req, @Res() res) {
		console.log(`User: ${req.user}`);
		return (
			req.user ? res.redirect(this.strategy.successRedirect) :
			res.redirect(this.strategy.failureRedirect)
		);
	}

	@Get('redirect_success')
	authorized(@Req() req) {
		console.log("skeet");
		return "Authenticated :O";
	}

	@Get('redirect_failure')
	unauthorized(@Req() req) {
		console.log('Yeet');
		return 'Whoopsie daisy';
	}
}

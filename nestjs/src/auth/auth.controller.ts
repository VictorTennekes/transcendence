import { Body, Controller, Get, Logger, Post, Req, Res, Session, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { redirectPage } from '@shared/redirect';
import { Response } from 'express';
import { authenticate } from 'passport';
import { AuthService } from './auth.service';
import { AuthenticatedGuard } from './authenticated.guard';
import { LoginGuard } from './login.guard';
import { No2FAGuard } from './no-2fa.guard';
import { UnauthorizedFilter } from './unauthorized.filter';

// function redirectPage(url: string) {
// 	return (`<html><body>
// 	<h1>Redirecting...</h1>
// 	<p>Press button below if you are not redirected</p>
// 	<button onclick="redirect()">To the app</button>
	
// 	<script>
// 	var toRedirect = "${url}";
// 	function redirect() {
// 	  window.location.href = toRedirect;
// 	}
// 	window.addEventListener("load", redirect);
// 	redirect();
// 	</script>
// 	</html></body>`);
// }

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
	) {}

	//when first logging in, navigate user here
	@Get('redirect')
	@UseGuards(LoginGuard)
	@UseFilters(UnauthorizedFilter)
	async login(@Req() req) {
		if (req.user.two_factor_enabled) {
			return(redirectPage('http://localhost:4200/2fa'));
		}
		return (redirectPage('http://localhost:4200/'));
	}

	@Get('@session')
	@UseGuards(No2FAGuard)
	@UseFilters(UnauthorizedFilter)
	session(@Req() req) {
		Logger.log(JSON.stringify(req.user));
		return {
			user: req.user.intra_name,
			two_factor_enabled: req.user.two_factor_enabled,
			two_factor_passed: req.session.two_factor,
		};
	}

	@Get('logout')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	logout(@Req() req) {
		console.log('uhh');
		req.session.destroy();
	}
}

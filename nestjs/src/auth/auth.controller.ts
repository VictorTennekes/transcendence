import { Controller, Get, Logger, Post, Req, Res, Session, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthenticatedGuard } from './authenticated.guard';
import { LoginGuard } from './login.guard';
import { UnauthorizedFilter } from './unauthorized.filter';

@Controller('auth')
export class AuthController {
	constructor() {}

	//when first logging in, navigate user here
	@Get('redirect')
	@UseGuards(LoginGuard)
	@UseFilters(UnauthorizedFilter)
	async login(@Req() req, @Res() res: Response) {
		//		res.set('Set-Cookie', `sid=${req.session["cookie"]}`);
		res.redirect('/auth/redirect_success');
	}
	
	//subsequent visits will have the authorization header appended
	@Get('redirect_success')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	authorized(@Req() req) {

		return ("AUTHENTICATED :O");
//		res.redirect('http://localhost:4200/success');
	}
	
	//requests without authorization header get sent here (by UnauthorizedFilter)
	@Get('redirect_failure')
	unauthorized(@Req() req, @Res() res) {
		res.redirect('http://localhost:4200/fail');
	}
}

import { Controller, Get, Logger, Post, Req, Res, Session, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
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
		console.log(`User: ${JSON.stringify(req.user)}`);
		console.log(`User: ${JSON.stringify(req.session)}`);
		console.log(`${req.session.passport}`);
		//		res.set('Set-Cookie', `sid=${req.session["cookie"]}`);
		res.redirect('/auth/redirect_success');
	}
	
	//subsequent visits will have the authorization header appended
	@Get('redirect_success')
	@UseFilters(UnauthorizedFilter)
	authorized(@Req() req, @Res() res) {

		res.redirect('http://localhost:4200/success');
	}
	
	//requests without authorization header get sent here (by UnauthorizedFilter)
	@Get('redirect_failure')
	unauthorized(@Req() req, @Res() res) {
		console.log('Yeet');
		res.redirect('http://localhost:4200/fail');
	}
}

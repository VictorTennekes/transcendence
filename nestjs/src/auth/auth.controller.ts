import { Body, Controller, Get, Logger, Post, Req, Res, Session, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { authenticate } from 'passport';
import { AuthService } from './auth.service';
import { AuthenticatedGuard } from './authenticated.guard';
import { LoginGuard } from './login.guard';
import { UnauthorizedFilter } from './unauthorized.filter';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
	) {}

	//when first logging in, navigate user here
	@Get('redirect')
	@UseGuards(LoginGuard)
	@UseFilters(UnauthorizedFilter)
	async login(@Req() req, @Res() res: Response) {
		res.redirect('http://localhost:4200/');
	}

	//requests without authorization header get sent here (by UnauthorizedFilter)
	@Get('unauthorized')
	unauthorized(@Req() req, @Res() res) {
		res.redirect('http://localhost:4200/');
	}

	@Get('logout')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	logout(@Req() req) {
		req.session.destroy();
	}
}

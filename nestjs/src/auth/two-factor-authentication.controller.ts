import {
	ClassSerializerInterceptor,
	Controller,
	Header,
	Post,
	UseInterceptors,
	Res,
	UseGuards,
	Req,
	UseFilters,
	Body,
	HttpCode,
	UnauthorizedException,
	Get,
	Logger,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { Response } from 'express';
import { AuthenticatedGuard } from './authenticated.guard';
import { UnauthorizedFilter } from './unauthorized.filter';
import { UserService } from '@user/user.service';
import { request } from 'http';
import { No2FAGuard } from './no-2fa.guard';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly userService: UserService,
	) {}
	
	@Get('generate')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async register(@Req() request) {
		const { otpauthUrl } = await this.twoFactorAuthenticationService.getTwoFactorAuthenticationURL(request.user);
		
		return JSON.stringify(otpauthUrl);
	}

	//request a valid code, catch the error in the frontend, if no error, switch 2fa setting to true.
	@Post('turn-on')
	@UseGuards(AuthenticatedGuard)
	async turnOnTwoFactorAuthentication(
		@Req() request,
		@Body() twoFactorAuthenticationCode
	) {
		Logger.log(`AUTHENTICATE - 2FA-CODE: ${JSON.stringify(twoFactorAuthenticationCode)}`);

		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode.code, request.user
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		else {
			Logger.log(`CODE IS VALID!!!`);
		}
		return (true);
	}

	@Post('authenticate')
	@UseGuards(No2FAGuard)
	@UseFilters(UnauthorizedFilter)
	async authenticate(@Req() req, @Body() twoFactorAuthenticationCode) {
		Logger.log(`AUTHENTICATE - 2FA-CODE: ${JSON.stringify(twoFactorAuthenticationCode)}`);
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode.code, req.user);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		else {
			Logger.log("CORRECT CODE ENTERED");
		}
		req.session.two_factor = true;
		req.session.save();
		return true;
	}
}

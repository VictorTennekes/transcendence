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
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { Response } from 'express';
import { AuthenticatedGuard } from './authenticated.guard';
import { UnauthorizedFilter } from './unauthorized.filter';
import { UserService } from '@user/user.service';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly userService: UserService
	) {}

	@Post('generate')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async register(@Res() response, @Req() request) {
		const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.user);
		
		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}
	
	@Post('turn-on')
	@HttpCode(200)
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async turnOnTwoFactorAuthentication(
		@Req() request,
		@Body() twoFactorAuthenticationCode : string
	) {
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode, request.user
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.userService.update(request.session.passport.user.intra_name, {two_factor_secret: true});
	}
}

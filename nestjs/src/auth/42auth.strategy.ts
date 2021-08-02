import { Strategy } from 'passport-42';
import { AuthModuleOptions, PassportStrategy } from '@nestjs/passport';
import { HttpException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
// import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { toPromise } from '@shared/utils';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { AuthService } from './auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
	constructor(
		private options: AuthModuleOptions,
		private readonly authService: AuthService,
		private config: ConfigService
	) {
		super({
			clientID: config.get('ID'),
			clientSecret: config.get('SECRET'),
			callbackURL: config.get('CALLBACK_URL'),
			profileFields: {
				'intraName': 'login',
				'displayName' : 'displayname'
			}
		});
	}
	//already authenticated by OAuth2
	async validate(accessToken: string, refreshToken: string, profile): Promise<any> {
		if (!profile)
			return (null);
		const user = await this.authService.validateUser(profile.intraName);
		return (user);
	}
	public successRedirect: string = this.options['successRedirect'];
	public failureRedirect: string = this.options['failureRedirect'];
}

import { Strategy } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, Request, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { toPromise } from '@shared/utils';
import { AuthService } from './auth.service';
import * as session from 'express-session';

const postgres = require('connect-pg-simple');

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly authService: AuthService,
		private config: ConfigService
	) {
		super({
//			passReqToCallback: true, //to be able to pass @Request req to `validate`
			clientID: config.get('ID'),
			clientSecret: config.get('SECRET'),
			callbackURL: config.get('CALLBACK_URL'),
			profileFields: {
				'intraName': 'login',
				'displayName' : 'displayname'
			},
			passReqToCallback: true
		});
	}
	//already authenticated by OAuth2
	async validate(request, accessToken: string, refreshToken: string, profile): Promise<any> {
		profile = profile ?? request.user;
		if (!profile)
			return null;
		const user = await this.authService.validateUser(profile.intraName);
		// console.log(`USER ITEM: ${JSON.stringify(user)}`);
		// const sessionItem = request.sessionStore.get(request.sessionID, (err, session) => {
		// 	console.log(session);
		// });
		if (!user.two_factor_enabled)
			return (user);
			//		if (request.session.)
		return (user);
	}
}

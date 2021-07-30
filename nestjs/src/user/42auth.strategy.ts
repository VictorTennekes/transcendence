import { Strategy } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
// import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { toPromise } from '@shared/utils';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private config: ConfigService) {
		super({
			clientID: config.get('ID'),
			clientSecret: config.get('SECRET'),
			callbackURL: "http://localhost:3000/user/home",
			profileFields: {
				'intraName': 'login',
				'displayName' : 'displayname'
			}
		});
	}
	//already authenticated by OAuth2
	async validate(accessToken: string, refreshToken: string, profile, done: (err, profile) => any): Promise<any> {

		return (done(null, profile));
	}
}

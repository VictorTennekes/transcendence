import { Strategy } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
// import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private config: ConfigService) {
		super({
			clientID: config.get('ID'),
			clientSecret: config.get('SECRET'),
			callbackURL: "localhost/user/home"
		});
	}
	
	async validate(username: string, password: string): Promise<any> {
		const user = { username, password };
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}

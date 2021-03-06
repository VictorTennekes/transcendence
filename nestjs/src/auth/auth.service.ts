import { HttpException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '@user/user.service';
import { Repository } from 'typeorm';

//Anything that relates to authentication goes here
@Injectable()
export class AuthService {
	constructor (
		private readonly userService: UserService,
	) {}

	async validateUser (login: string): Promise<any> {
		try {
			if (!login)
				throw new UnauthorizedException("Missing login");
			let user = await this.userService.findOrCreateByLogin(login);
			if (!user)
				throw new UnauthorizedException("Failed to fetch or create user");
			return (user);
		}
		catch (err) {
			return (null);
		}
	}
}

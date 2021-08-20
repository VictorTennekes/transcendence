import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '@user/user.service';
import { Repository } from 'typeorm';
import { SessionEntity } from './entity/session.entity';
import { SessionSerializer } from './session.serializer';

//Anything that relates to authentication goes here
@Injectable()
export class AuthService {
	constructor (
		private readonly userService: UserService,
		@InjectRepository(SessionEntity)
		private readonly sessionRepository: Repository<SessionEntity>
	) {}

	async validateUser (login: string): Promise<any> {
		try {
			console.log(`validateUser - login: ${login}`);
			if (!login)
				throw new UnauthorizedException("Missing login");
			let user = await this.userService.findOrCreateByLogin(login);
			if (!user)
				throw new UnauthorizedException("Failed to fetch or create user");
			return (user);
		}
		catch (err) {
			console.log(err.message);
			return (null);
		}
	}
}

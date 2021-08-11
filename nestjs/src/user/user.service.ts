import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePasswords, toPromise } from 'src/shared/utils';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDTO } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';
import { LoginStatus } from './interfaces/login-status.interface';

//everything related to getting/modifying/updating entries in the 'user_entity' table is done by this.

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>
	) {}

	async findOrCreateByLogin(login: string) {
		let user = await this.findOne(login);
		if (!user) {
			user = await this.create(login)
			console.log(`CREATED USER ${login}`);
		}
		else {
			console.log(`FOUND EXISTING USER ${login}`);
		}
		return (user);
	}

	async create(login: string) {
		const intra_name = login;
		const display_name = intra_name;
		const user: UserEntity = this.userRepository.create({ intra_name, display_name,});
		await this.userRepository.save(user);
		return (user);
	}

	findAll() {
		return `This action returns all user`;
	}
	
	findOne(login: string) {
		const intra_name = login;
		return this.userRepository.findOne({where: { intra_name }});
	}

	async login(loginInformation: LoginUserDto): Promise<LoginStatus> {
		const intra_name = loginInformation.intra_name;
		const user = await this.findOrCreateByLogin(intra_name);
		return ({succes: true});
	}
}

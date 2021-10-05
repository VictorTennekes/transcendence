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

	//Might want to add case insensitive checking
	async checkDisplayName(currentDisplayName: string, display_name: string) {
		if (!display_name) {
			return false;
		}
		if (currentDisplayName == display_name) {
			return true;
		}
		const isAvailable = await this.userRepository.count({where: {display_name}}) ? false : true;
		return isAvailable;
	}

	async setTwoFactorAuthenticationSecret(secret: string, login: string) {
		await this.update(login, {two_factor_secret: secret});
	}

	async update(login: string, changedData: any) {
		console.log(`data: ${changedData}`);
		let user = await this.findOne(login);
		//validate that displayName is unique (?)
		user = await this.userRepository.save({
			...user,
			...changedData
		});
		//handle errors thrown by 'save' for possible uniqueness issues.
		console.log(`updated user: ${JSON.stringify(user)}`);
	}


	async blockUser(username: string, blockedUsername: string) {
		console.log("username: ", username);
		let user: UserEntity = await this.userRepository.findOne({
			where: {intra_name: username},
			relations: ["blockedUsers"]
		});
		if (username == blockedUsername)
			return ;
		let blockedUser: UserEntity = await this.userRepository.findOne({
			where: {intra_name: blockedUsername},
			relations: ["blockedByUsers"]
		});
		console.log("these are the users");
		console.log(user);
		console.log(blockedUser);
		user.blockedUsers.push(blockedUser);
		blockedUser.blockedByUsers.push(user);
		this.userRepository.save(user);
		this.userRepository.save(blockedUser);
	}

	async create(login: string) {
		const intra_name = login;
		const display_name = intra_name;
		const user: UserEntity = this.userRepository.create({ intra_name, display_name,});
		await this.userRepository.save(user);
		return (user);
	}
	
	async findOne(login: string) {
		const user =  await this.userRepository.findOne({where: { intra_name: login }});
		Logger.log(`FINDONE - LOGIN: ${login} - ${JSON.stringify(user)}`);
		return user;
	}

	async findUserWithBlocks(login: string) {
		return await this.userRepository.findOne({
			where: { intra_name: login },
			relations: ["blockedUsers", "blockedByUsers"]
		});
	}

	async login(loginInformation: LoginUserDto): Promise<LoginStatus> {
		const intra_name = loginInformation.intra_name;
		const user = await this.findOrCreateByLogin(intra_name);
		return ({succes: true});
	}
}

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/game/game.script';
import { comparePasswords, toPromise } from 'src/shared/utils';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDTO } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';
import { LoginStatus } from './interfaces/login-status.interface';
import { Socket } from "socket.io";
import { parse } from "cookie";
import { SessionEntity } from './entities/session.entity';

//everything related to getting/modifying/updating entries in the 'user_entity' table is done by this.

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(SessionEntity)
		private readonly sessionRepo: Repository<SessionEntity>
	) {}

	async getUserFromSocket(socket: Socket) {
		const cookie = socket.handshake.headers.cookie;
		if (!cookie) return null;
		const parsedCookie = parse(cookie);
		const cookieData = parsedCookie['connect.sid'];
	
		let sid = cookieData.substr(2, cookieData.indexOf(".") - 2);
	
		const session = await this.sessionRepo.findOne({where: {sid: sid}});
		const parsedSession: any = session.sess;
		const user = await this.findUserWithBlocks(parsedSession.passport.user.login);
		return user;
	}

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

	async save(user: UserEntity) {
		await this.userRepository.save(user);
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
		let user: UserEntity = await this.userRepository.findOne({
			where: {intra_name: username},
			relations: ["blockedUsers", "friends"]
		});
		if (username == blockedUsername)
			return ;
		let blockedUser: UserEntity = await this.userRepository.findOne({
			where: {intra_name: blockedUsername},
			relations: ["blockedByUsers", "friends"]
		});
		let index = user.blockedUsers.findIndex(x => x.intra_name === username);
		if (index === -1) {
			user.blockedUsers.push(blockedUser);
			blockedUser.blockedByUsers.push(user);
			this.userRepository.save(user);
			this.userRepository.save(blockedUser);
		}
		index = user.friends.findIndex(x => x.intra_name === blockedUsername);
		if (index !== -1) {
			user.friends.splice(index, 1);
			this.userRepository.save(user);
		}
		index = blockedUser.friends.findIndex(x => x.intra_name === username);
		if (index !== -1) {
			blockedUser.friends.splice(index, 1);
			this.userRepository.save(blockedUser);
		}
	}

	async unblockUser(username: string, blockedUsername: string) {
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
		let index = user.blockedUsers.findIndex(x => x.intra_name === username);
		if (index !== -1) {
			user.blockedUsers.splice(index, 1);
			this.userRepository.save(user);
		}
		index = blockedUser.blockedByUsers.findIndex(x => x.intra_name === username);
		if (index !== -1) {
			blockedUser.blockedByUsers.splice(index, 1);
			this.userRepository.save(blockedUser);
		}
	}

	async addFriend(username: string, friendUsername: string) {
		let user: UserEntity = await this.userRepository.findOne({
			where: {intra_name: username},
			relations: ["friends"]
		});
		if (username === friendUsername) {
			return ;
		}
		let friend: UserEntity = await this.userRepository.findOne({
			where: {intra_name: friendUsername},
			relations: ["friends"]
		})
		let index = user.friends.findIndex(x => x.intra_name === friendUsername);
		if (index === -1) {
			user.friends.push(friend);
			friend.friends.push(user);
			this.userRepository.save(user)
			this.userRepository.save(friend)
		}
	}

	async unfriend(username: string, friendUsername: string) {
		let user: UserEntity = await this.userRepository.findOne({
			where: {intra_name: username},
			relations: ["friends"]
		});
		if (username === friendUsername) {
			return ;
		}
		let friend: UserEntity = await this.userRepository.findOne({
			where: {intra_name: friendUsername},
			relations: ["friends"]
		})
		let index = user.friends.findIndex(x => x.intra_name === friendUsername);
		if (index !== -1) {
			user.friends.splice(index, 1);
			this.userRepository.save(user)
		}
		index = friend.friends.findIndex(x => x.intra_name === username);
		if (index !== -1) {
			friend.friends.splice(index, 1);
			this.userRepository.save(friend)
		}
	}

	async create(login: string) {
		const intra_name = login;
		const display_name = null;
		const user: UserEntity = this.userRepository.create({
			intra_name,
			display_name,
			gameData: {
				ballHits: 0,
				games: {
					won: 0,
					lost: 0,
				},
				points: {
					won: 0,
					lost: 0,
				},
				gameDurationInSeconds: {
					total: 0,
					shortest: null,
					longest: null
				}
			}
		});
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

	async getFriends(username: string): Promise<UserDTO[]> {
		const user = await this.userRepository.findOne({
			where: {intra_name: username},
			relations: ["friends"]
		})
		console.log(user);
		return user.friends;
	}

	async getBlockedByUsers(username: string): Promise<UserDTO[]> {
		const user = await this.userRepository.findOne({
			where: {intra_name: username},
			relations: ["blockedByUsers"]
		})
		console.log(user);
		return user.blockedByUsers;
	}

	async login(loginInformation: LoginUserDto): Promise<LoginStatus> {
		const intra_name = loginInformation.intra_name;
		const user = await this.findOrCreateByLogin(intra_name);
		return ({succes: true});
	}
}

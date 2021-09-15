import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { toPromise } from "@shared/utils";
import { ChatDTO } from "@chat/dto/chat.dto";
import { NewChatDTO } from "@chat/dto/newChat.dto";
import { ChatEntity } from "@chat/entity/chat.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MessageDTO} from "@chat/dto/message.dto";
import { MessageEntity } from "@chat/entity/message.entity";
import { UserDTO } from "@user/dto/user.dto";
import { UserEntity } from "@user/entities/user.entity";
import * as bcrypt from 'bcryptjs';
import { stringify } from "querystring";
import { Observable } from "rxjs";
import { updateChatDTO, updateUsersDTO } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { BanEntity } from "./entity/ban.entity";

export class banDTO {
	// id: string;
	user: UserDTO;
	endTime: Date;
	chat: ChatEntity;
}

@Injectable()
export class ChatService {
	constructor(@InjectRepository(ChatEntity) private readonly repo: Repository<ChatEntity>,
				@InjectRepository(MessageEntity) private readonly msgRepo: Repository<MessageEntity>,
				@InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
				@InjectRepository(BanEntity) private readonly banRepo: Repository<BanEntity>) {}

	private userExists(username: string, users: UserDTO[]) {
		return users.some(function(el) {
			return el.intra_name === username;
		});
	}

	private isCurrent(time: Date) {
		let now = new Date
		now.setHours(0,0,0,0);
		if (time < now) {
			console.log("Selected date is in the past");
			return false;
		} else {
			console.log("Selected date is NOT in the past");
			return true;
		}

	}

	async getChatById(uuid: string): Promise<ChatDTO> {
		const item = await this.repo.findOne({
			where: {id: uuid},
			relations: ["users", "admins"]
		});

		const msgs = (await this.getMessagesFromChat(uuid)).reverse();
		if (!item) {
			console.log("not finding chat in chatbyId");
			throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
		}

		const ret: ChatDTO = {
			id: item.id,
			name: item.name,
			visibility: item.visibility,
			admins: item.admins,
			users: item.users,
			messages: msgs
		}
		return toPromise(ret);
	}

	private getMatchingUsers(items: ChatEntity[], users: UserDTO[]) {
		let item;
		for (let i = 0; i < items.length; i++) {
			let count = 0;
			for (let j = 0; j < users.length; j++) {
				if (users.length === 1) {
					if (items[i].users.length === 1
						&& users.length === 1
						&& items[i].users[0].intra_name === users[0].intra_name) {
						item = items[i];
						return item;
					}
				} else {
					if (this.userExists(users[j].intra_name, items[i].users)) {
						count++;
					}
					if (count == users.length) {
						item = items[i];
						return item;
					}
				}

			}
		}
		return null;
	}

	async getAllChatsByUser(username: string): Promise<ChatDTO[]> {
		const chats = await this.repo
		.createQueryBuilder('chat')
		.innerJoin('chat.users', 'users')
		.where('users.intra_name = :username', { username })
		.getMany();

		for (let chat in chats) {
			chats[chat] = await this.repo
					.createQueryBuilder('chat')
					.leftJoinAndSelect('chat.users', 'users')
					.where('chat.id = :id', {id: chats[chat].id})
					.getOne();
		}
		if (!chats) {
			throw new HttpException("no such user", HttpStatus.BAD_REQUEST);
		}
		return toPromise(chats)
	}

	async getChatByUsers(users: UserDTO[]): Promise<ChatDTO> {
		const items = await this.repo
				.createQueryBuilder("chat")
				.innerJoinAndSelect("chat.users", "users")
				.getMany();
		let item = this.getMatchingUsers(items, users);

		if (!item) {
			return null;
		}
		const ret: ChatDTO = {
			id: item.id,
			name: item.name,
			visibility: item.visibility,
			admins: item.admins,
			users: item.users,
			messages: item.messages
		}
		return toPromise(ret);

	}

	async getChatByName(name: string, username: string): Promise<ChatDTO[]> {
		let chats = await this.repo
		.createQueryBuilder("chat")
		.innerJoinAndSelect("chat.users", "users")
		.where("chat.name = :name", {name})
		.andWhere("(chat.visibility != 'private' OR users.intra_name = :username)", {username})
		.getMany()

		return toPromise(chats);
	}

	async createNewChat(newChat: NewChatDTO): Promise<ChatDTO> {
		let item: ChatEntity = await this.repo.create({
			name: newChat.name,
			users: newChat.users,
			visibility: newChat.visibility,
			admins: newChat.admins,
			password: newChat.password
		});
		item = await this.repo.save(item);
		let msg: MessageDTO[] = []
		if (item.messages) {
			msg = item.messages;
		}
		const ret: ChatDTO = {
			id: item.id,
			name: item.name,
			visibility: item.visibility,
			admins: item.admins,
			users: item.users,
			messages: msg
		}
		return toPromise(ret);
	}

	async createNewMessage(newMessage: MessageDTO): Promise<MessageDTO> {
		const {owner, time, message, chat} = newMessage;
		const item: MessageEntity = await this.msgRepo.create({
			owner,
			time,
			message,
			chat
		});
		await this.msgRepo.save(item);
		const ret: MessageDTO = {
			id: item.id,
			time: item.time,
			owner: item.owner,
			message: item.message,
			chat: item.chat
		}
		return toPromise(ret);
	}

	async createNewMessageSocket(message: string, owner: UserDTO, chat: ChatDTO): Promise<MessageDTO> {
		const item: MessageEntity = await this.msgRepo.create({
			owner,
			message,
			chat,
		});
		await this.msgRepo.save(item);
		const ret: MessageDTO = {
			id: item.id,
			time: item.time,
			owner: item.owner,
			message: item.message,
			chat: item.chat
		}
		return toPromise(ret);
	}

	async getAllMessages(): Promise<MessageDTO[]> {
		return await this.msgRepo.find();
	}

	async getMessagesFromChat(id: string): Promise<MessageDTO[]> {
		const items = await this.msgRepo.find({
			where: {chat: id},
			relations: ["owner"],
			order: {
				time: "DESC"
			},
			skip: 0,
			take: 6,
		});

		if (!items) {
			throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
		}
		return items;
	}

	async validatePassword(pass: string, chatId: string): Promise<boolean> {
		const chat = await this.repo.findOne({where: {
			id: chatId
		}})
		let val = toPromise(bcrypt.compareSync(pass, chat.password));
		return toPromise(val);
	}

	async userCanAccessChat(username: string, chatId: string):  Promise<boolean>{
		// const chat = await this.getChatById(chatId);
		const chat = await this.repo.findOne({
			where: {id: chatId},
			relations: ["bans", "users", "bans.user"]
		})
		console.log(chat);
		for (let ban of chat.bans) {
			console.log(ban);
			console.log(username);
			if (ban.user.intra_name === username && this.isCurrent(ban.endTime)) {//TODO: and ban is still valid
				console.log("i should be banned");
				throw new HttpException("you are banned", HttpStatus.NOT_ACCEPTABLE);
			}
		}
		if (chat.visibility !== 'public') {
			if (this.userExists(username, chat.users)) {
				return true;
			} else if (chat.visibility === 'protected'){
				throw new HttpException("User has no rights ", HttpStatus.FORBIDDEN);
			} else if (chat.visibility === 'private' || chat.visibility === 'direct') {
				throw new HttpException("this is a private chat", HttpStatus.UNAUTHORIZED);
			}
		} else {
			return true;
		}
	}

	async addUserToChat(id: string, user: UserDTO): Promise<ChatDTO> {
		let chat: ChatEntity = await this.repo.findOne({
			where: {id: id},
			relations: ["users"]
		});
		if (!this.userExists(user.intra_name, chat.users)) {
			chat.users.push(user);
			const lol = await this.repo.manager.save(chat);
			return lol;
		}
	}

	async updateAdmins(admins: updateChatDTO): Promise<ChatDTO> {
		Logger.log("update admins:")
		console.log(admins.id);
		console.log(admins);
		let chat: ChatEntity = await this.repo.findOne({
			where: {id: admins.id},
			relations: ["users", "admins"]
		});
		console.log("chat is: ", chat);
		if (!chat) {
			throw new HttpException("Chat not found", HttpStatus.NOT_FOUND);
		}
		console.log("found chat");
		// for (let username of admins.admin) {
			let user = await this.userRepo.findOne({
				where: {intra_name: admins.admin}
			})
			if (!user) {
				throw new HttpException("User not found", HttpStatus.NOT_FOUND);
			}
			console.log("lol");
			console.log(chat);
			console.log(user);
			if (!this.userExists(user.intra_name, chat.users)) {
				chat.users.push(user);
			}
			chat.admins.push(user);
			console.log(user);
		// }
		//TODO: do not add duplicate admins
		const lol = await this.repo.save(chat);
		console.log(lol);
		return lol;
	}

	async addBannedUser(ban: updateChatDTO): Promise<ChatDTO> {
		let chat: ChatEntity = await this.repo.findOne({
			where: {id: ban.id},
			relations: ["bans"]
		});
		// for (let username of ban.users) {
			let user = await this.userRepo.findOne({
				where: {intra_name: ban.bannedUser}
			})
			if (!user) {
				throw new HttpException("User not found", HttpStatus.NOT_FOUND);
			}
			// chat.admins.push(user);
			
			// chat.bans.push(user);

			console.log(user);
			// let b: banDTO = {
				// id: "",
				// user: user,
				// chat: chat,
				// endTime: ban.bannedTime,

			// }
			//TODO: do not multpile bans for same person and chat. just extend the time if needed
			let b = await this.banRepo.create({
				chat: chat,
				user: user,
				endTime: ban.bannedTime
			});
			chat.bans.push(b);
		// }
		const lol = await this.repo.save(chat);
		console.log(lol);
		return lol;
	}

	async addMutedUser(ban: updateChatDTO): Promise<ChatDTO> {
		console.log("muting a user");
		let chat: ChatEntity = await this.repo.findOne({
			where: {id: ban.id},
			relations: ["mutes"]
		});
		console.log(chat);
		console.log(ban);
		// for (let username of ban.users) {
			console.log("username: ", ban.mutedUser);
			let user = await this.userRepo.findOne({
				where: {intra_name: ban.mutedUser}
			})
			console.log(user);
			if (!user) {
				throw new HttpException("User not found", HttpStatus.NOT_FOUND);
			}
			// chat.admins.push(user);
			
			// chat.bans.push(user);

			console.log(user);
			// let b: banDTO = {
				// id: "",
				// user: user,
				// chat: chat,
				// endTime: ban.bannedTime,

			// }
			//TODO: do not multpile bans for same person and chat. just extend the time if needed
			let b = await this.banRepo.create({
				chat: chat,
				user: user,
				endTime: ban.bannedTime
			});
			chat.mutes.push(b);
		// }
		const lol = await this.repo.save(chat);
		console.log(lol);
		return lol;
	}

	async editVisibility(data: updateChatDTO): Promise<ChatDTO> {
		let chat: ChatEntity = await this.repo.findOne({
			where: {id: data.id}
		})
		if (chat.visibility != data.visibility
			&& ['private', 'direct', 'protected', 'public'].includes(data.visibility)) {
			chat.visibility = data.visibility;
		}
		if (data.visibility === 'protected') {
			chat.password = data.password;
		}
		console.log("editing visibility");
		console.log(data);
		let res = await this.repo.save(chat);
		console.log(res);
		return res;
	}

	async userIsMuted(user: UserDTO, chatId) {
		const chatMutes = await this.repo.findOne({
			where: {id: chatId},
			relations: ["mutes", "mutes.user"]
		})
		console.log(chatMutes);
		for(let mute of chatMutes.mutes) {
			console.log("mute");
			console.log(mute);
			console.log(user);
			if (mute.user.intra_name === user.intra_name && this.isCurrent(mute.endTime)) {//TODO: make sure mute is current
				return true;
			}
		}	
		return false;
	}

	async userIsAdmin(id: string, username: string): Promise<boolean> {
		const chat = await this.repo.findOne({
			where: {id: id},
			relations: ["admins"]
		})
		console.log(chat);
		if (this.userExists(username, chat.admins)) {
			return true;
		}
		return false;
	}

}

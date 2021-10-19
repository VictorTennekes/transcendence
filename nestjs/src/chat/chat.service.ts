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
import { updateChatDTO } from "./chat.controller";
import { BanEntity } from "./entity/ban.entity";

export class banDTO {
	type: string;
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

	public userExists(username: string, users: UserDTO[]) {
		return users.some(function(el) {
			return el.intra_name === username;
		});
	}

	private isCurrent(time: Date) {
		if (!this.isValidDate(time)) {
			throw "invalid date";
		}
		let now = new Date();
		return (time.getTime() > now.getTime());
	}

	private chatEntityToDTOArray(chats: ChatEntity[]): ChatDTO[] {
		let res: ChatDTO[] = [];
		for (let chat of chats) {
			let convertedChat: ChatDTO = {
				id: chat.id,
				name: chat.name,
				visibility: chat.visibility,
				owner: chat.owner,
				admins: chat.admins,
				users: chat.users,
				messages: chat.messages
			}
			res.push(convertedChat);
		}
		return res;
	}

	private chatEntityToDTO(chat: ChatEntity): ChatDTO {
		let res: ChatDTO = {
			id: chat.id,
			name: chat.name,
			visibility: chat.visibility,
			owner: chat.owner,
			admins: chat.admins,
			users: chat.users,
			messages: chat.messages
		}
		return res;
	}

	private async banExists(username: string, bans: BanEntity[]): Promise<BanEntity> {
		for(let ban of bans) {
			let fullBan = await this.banRepo.findOne({
				where: {id: ban.id},
				relations: ["user"]
			})
			if (fullBan.user.intra_name === username) {
				return ban;
			}
		}
	}

	private stringToDate(d: string): Date {
		if (!d || d === "") {
			throw "invalid date";
		}
		let dateObj: Date = new Date(d);
		if (this.isValidDate(dateObj)) {
			return dateObj;
		}
		throw "invalid date";
	}

	private isValidDate(d): boolean {
		return d instanceof Date && !isNaN(d.getTime());
	}

	private async filterMessagesByBlocks(msgs: MessageEntity[], target_name: string): Promise<MessageEntity[]> {
		let filteredMessages: MessageEntity[] = [];
		const user: UserDTO = await this.userRepo.findOne({
			where: {intra_name: target_name},
			relations: ["blockedUsers"]
		});
		for (let msg of msgs) {
			if (!this.userExists(msg.owner.intra_name, user.blockedUsers)) {
				filteredMessages.push(msg);
			}
		}
		return filteredMessages;
	}

	async getChatById(uuid: string, intra_name: string): Promise<ChatDTO> {
		const item: ChatEntity = await this.repo.findOne({
			where: {id: uuid},
			relations: ["users", "admins"]
		});

		let msgs: MessageDTO[] = (await this.getMessagesFromChat(uuid, intra_name)).reverse();
		if (!item) {
			throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
		}
		let chat: ChatDTO = this.chatEntityToDTO(item);
		if (!msgs) {
			msgs = [];
		}
		chat.messages = msgs;
		return toPromise(chat);
	}

	private getMatchingUsers(chats: ChatEntity[], users: UserDTO[]) {
		for (const chat of chats) {
			if (users.length === 1 && chat.users.length === 1 && chat.users[0].intra_name === users[0].intra_name) {
				return chat;
			}
			if (users.length !== 1) {
				let amtMatching = 0;
				for (const user of users) {
					for (let chatUser of chat.users) {
						if (chatUser.intra_name === user.intra_name) {
							amtMatching++;
						}
						if (amtMatching === users.length) {
							return chat;
						}
					}
					
				}
			}
		}
		return null;
	}

	async getAllChatsByUser(username: string): Promise<ChatDTO[]> {
		const chats: ChatEntity[] = await this.repo
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
		
		return toPromise(this.chatEntityToDTOArray(chats));
	}

	async getChatByUsers(users: UserDTO[]): Promise<ChatDTO> {
		const items = await this.repo
				.createQueryBuilder("chat")
				.innerJoinAndSelect("chat.users", "users")
				.where({visibility: "direct"})
				.getMany();
		let item = this.getMatchingUsers(items, users);
		if (!item) {
			return null;
		}
		return toPromise(this.chatEntityToDTO(item));

	}

	async getChatByName(name: string, username: string): Promise<ChatDTO[]> {
		let chats: ChatEntity[] = await this.repo
		.createQueryBuilder("chat")
		.innerJoinAndSelect("chat.users", "users")
		.where("chat.name = :name", {name})
		.andWhere("(chat.visibility != 'private' OR users.intra_name = :username)", {username})
		.getMany()

		return toPromise(this.chatEntityToDTOArray(chats));
	}

	async createNewChat(newChat: NewChatDTO): Promise<ChatDTO> {
		let item: ChatEntity = await this.repo.create({
			name: newChat.name,
			owner: newChat.owner,
			users: newChat.users,
			visibility: newChat.visibility,
			admins: newChat.admins,
			password: newChat.password
		});
		item = await this.repo.save(item);
		let ret: ChatDTO = this.chatEntityToDTO(item);
		let msg: MessageDTO[] = []
		if (item.messages) {
			msg = item.messages;
		}
		ret.messages = msg;
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

	async getMessagesFromChat(id: string, intra_name: string): Promise<MessageDTO[]> {
		let items = await this.msgRepo.find({
			where: {chat: id},
			relations: ["owner"],
			order: {
				time: "DESC"
			},
			skip: 0,
		});
		if (!items) {
			throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
		}
		items = await this.filterMessagesByBlocks(items, intra_name);
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
		const chat: ChatEntity = await this.repo
			.createQueryBuilder('chat')
			.where('chat.id = :id', {id: chatId})
			.leftJoinAndSelect('chat.bans', 'bans', 'bans.type = :type', {type: "ban"})
			.leftJoinAndSelect('chat.users', 'users')
			.getOne();
		try {
			let ban = await this.banExists(username, chat.bans);
			if (ban && this.isCurrent(ban.endTime)) {
				throw new HttpException("you're banned creep", HttpStatus.NOT_ACCEPTABLE);
			}
		} catch (error) {
			throw error;
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
			chat = await this.repo.manager.save(chat);
		}
		return toPromise(this.chatEntityToDTO(chat));
	}

	async userInChat(username: string, id: string): Promise<boolean> {
		const chat = await this.repo.findOne({
			where: {id: id},
			relations: ["users"]
		})
		if (this.userExists(username, chat.users)) {
			return true;
		}
		return false;
	}

	async updateAdmins(admins: updateChatDTO, username: string): Promise<ChatDTO> {
		//TODO: if user is owner
		let chat: ChatEntity = await this.repo.findOne({
			where: {id: admins.id},
			relations: ["users", "admins", "owner"]
		});
		if (!chat) {
			throw new HttpException("Chat not found", HttpStatus.NOT_FOUND);
		}
		if (chat.owner.intra_name !== username) {
			throw new HttpException("you're not the owner", HttpStatus.FORBIDDEN)
		}
		let user = await this.userRepo.findOne({
			where: {intra_name: admins.admin}
		})
		if (!user) {
			throw new HttpException("User not found", HttpStatus.NOT_FOUND);
		}
		if (!this.userExists(user.intra_name, chat.users)) {
			chat.users.push(user);
		}
		if (!this.userExists(user.intra_name, chat.admins)) {
			chat.admins.push(user);
		}
		const res = await this.repo.save(chat);
		return toPromise(this.chatEntityToDTO(res));
	}

	async addBannedUser(updateChat: updateChatDTO, username: string): Promise<ChatDTO> {
		//TODO: if user is admin
		let date: Date;
		try {
			date = this.stringToDate(updateChat.bannedTime);
		} catch (error) {
			throw new HttpException(error, HttpStatus.BAD_REQUEST);
		}
		const chat: ChatEntity = await this.repo
			.createQueryBuilder('chat')
			.where('chat.id = :id', {id: updateChat.id})
			.leftJoinAndSelect('chat.bans', 'bans', 'bans.type = :type', {type: "ban"})
			.leftJoinAndSelect('chat.admins', 'admins')
			.getOne();
		if (!this.userExists(username, chat.admins)) {
			throw new HttpException("you're not an admin", HttpStatus.FORBIDDEN)
		}
		let user = await this.userRepo.findOne({
			where: {intra_name: updateChat.bannedUser}
		})
		if (!user) {
			throw new HttpException("User not found", HttpStatus.NOT_FOUND);
		}
		let b: BanEntity;
		try {
			b = await this.banExists(user.intra_name, chat.bans);
			if (b.endTime.getTime() < date.getTime()) {
				b.endTime = date;
			}
			b = await this.banRepo.save(b);
		} catch (error) {
			b = await this.banRepo.create({
				chat: chat,
				user: user,
				endTime: updateChat.bannedTime,
				type: "ban"
			});
		}
		chat.bans.push(b);
		const res = await this.repo.save(chat);
		return toPromise(this.chatEntityToDTO(res));
	}

	async addMutedUser(updateChat: updateChatDTO, username: string): Promise<ChatDTO> {
		//TODO: if user is admin
		let date: Date;
		try {
			date = this.stringToDate(updateChat.bannedTime);
		} catch (error) {
			throw new HttpException(error, HttpStatus.BAD_REQUEST);
		}
		const chat: ChatEntity = await this.repo
			.createQueryBuilder('chat')
			.where('chat.id = :id', {id: updateChat.id})
			.leftJoinAndSelect('chat.bans', 'bans', 'bans.type = :type', {type: "mute"})
			.leftJoinAndSelect('chat.admins', 'admins')
			.getOne();

		if (!this.userExists(username, chat.admins)) {
			throw new HttpException("you're not an admin", HttpStatus.FORBIDDEN)
		}
		let user = await this.userRepo.findOne({
			where: {intra_name: updateChat.bannedUser}
		})
		if (!user) {
			throw new HttpException("User not found", HttpStatus.NOT_FOUND);
		}
		let mute: BanEntity;
		try {
			mute = await this.banExists(user.intra_name, chat.bans);
			if (mute.endTime.getTime() < date.getTime()) {
				mute.endTime = date;
			}
		} catch (error) {
			mute = await this.banRepo.create({
				chat: chat,
				user: user,
				endTime: date,
				type: "mute"
			});
		}
		chat.bans.push(mute);
		const res = await this.repo.save(chat);
		return toPromise(this.chatEntityToDTO(res));
	}

	async editVisibility(data: updateChatDTO, username: string): Promise<ChatDTO> {
		//TODO: if user is owner
		let chat: ChatEntity = await this.repo.findOne({
			where: {id: data.id},
			relations: ["owner"]
		})
		if (!chat) {
			throw new HttpException("can't find chat", HttpStatus.NOT_FOUND);
		}
		if (chat.owner.intra_name !== username) {
			throw new HttpException("you're not the owner", HttpStatus.FORBIDDEN)
		}
		if (chat.visibility != data.visibility
			&& ['private', 'direct', 'protected', 'public'].includes(data.visibility)) {
			chat.visibility = data.visibility;
		}
		if (data.visibility === 'protected') {
			chat.password = data.password;
		} else {
			chat.password = "";
		}
		let res = await this.repo.save(chat);
		return toPromise(this.chatEntityToDTO(res));
	}

	async userIsMuted(user: UserDTO, chatId: string) {
		const chatMutes: ChatEntity = await this.repo
			.createQueryBuilder('chat')
			.where('chat.id = :id', {id: chatId})
			.leftJoinAndSelect('chat.bans', 'bans', 'bans.type = :type', {type: "mute"})
			.getOne();
		try {
			let ban = await this.banExists(user.intra_name, chatMutes.bans)
			if (ban && this.isCurrent(ban.endTime)) {
				return true;
			}
		} catch (error) {
			return false
		}
	}

	async userIsAdmin(id: string, username: string): Promise<boolean> {
		const chat = await this.repo.findOne({
			where: {id: id},
			relations: ["admins"]
		})
		if (this.userExists(username, chat.admins)) {
			return true;
		}
		return false;
	}

	async leaveChat(chatId: string, username: string): Promise<boolean> {
		let chat = await this.repo.findOne({
			where: {id: chatId},
			relations: ["users", "admins", "owner"]
		})
		if (chat.visibility !== "direct") {
			for (let idx = 0; idx < chat.users.length; idx++) {
				if (chat.users[idx].intra_name === username) {
					chat.users.splice(idx, 1);
					break;
				}
			}
			for (let idx = 0; idx < chat.admins.length; idx++) {
				if (chat.admins[idx].intra_name === username) {
					chat.admins.splice(idx, 1);
					break;
				}
			}
			await this.repo.save(chat);
			if (chat.owner.intra_name === username) {
				await this.repo
				.createQueryBuilder()
				.relation(ChatEntity, "owner")
				.of(chat)
				.set(null);
			}		
		}
		return true;
  }

	async userIsOwner(id: string, username: string): Promise<boolean> {
		const chat = await this.repo.findOne({
			where: {id: id},
			relations: ["owner"]
		})
		return (chat.owner.intra_name === username);
	}

}

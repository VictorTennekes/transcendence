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

	private userExists(username: string, users: UserDTO[]) {
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
			admins: chat.admins,
			users: chat.users,
			messages: chat.messages
		}
		return res;
	}

	private async banExists(username: string, bans: BanEntity[]): Promise<BanEntity> {
		for(let ban of bans) {
			console.log(ban);
			let fullBan = await this.banRepo.findOne({
				where: {id: ban.id},
				relations: ["user"]
			})
			console.log("full ban: ")
			console.log(fullBan);
			if (fullBan.user.intra_name === username) {
				return ban;
			}
		}
	}

	private stringToDate(d: string): Date {
		let dateObj: Date = new Date(d);
		if (this.isValidDate(dateObj)) {
			return dateObj;
		}
		throw "invalid date";
	}

	private isValidDate(d): boolean {
		return d instanceof Date && !isNaN(d.getTime());
	  }

	async getChatById(uuid: string): Promise<ChatDTO> {
		const item: ChatEntity = await this.repo.findOne({
			where: {id: uuid},
			relations: ["users", "admins"]
		});

		let msgs: MessageDTO[] = (await this.getMessagesFromChat(uuid)).reverse();
		if (!item) {
			console.log("not finding chat in chatbyId");
			throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
		}
		let chat: ChatDTO = this.chatEntityToDTO(item);
		if (!msgs) {
			msgs = [];
		}
		chat.messages = msgs;
		return toPromise(chat);
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

		//TODO: ???
		let item: ChatEntity = await this.repo.create({
			name: newChat.name,
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
			//TODO: idk about this man
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

	async updateAdmins(admins: updateChatDTO): Promise<ChatDTO> {
		let chat: ChatEntity = await this.repo.findOne({
			where: {id: admins.id},
			relations: ["users", "admins"]
		});
		if (!chat) {
			throw new HttpException("Chat not found", HttpStatus.NOT_FOUND);
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

	async addBannedUser(updateChat: updateChatDTO): Promise<ChatDTO> {
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
			.getOne();
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

	async addMutedUser(updateChat: updateChatDTO): Promise<ChatDTO> {
		let date: Date;
		try {
			date = this.stringToDate(updateChat.bannedTime);
		} catch (error) {
			throw new HttpException(error, HttpStatus.BAD_REQUEST);
		}
		//TODO: catch user not found in client
	
		// TODO: THIS WILL ONLY RETURN CHATS WHEN THEY HAVE BANS TYPE MUTE
		const chat: ChatEntity = await this.repo
			.createQueryBuilder('chat')
			.where('chat.id = :id', {id: updateChat.id})
			.leftJoinAndSelect('chat.bans', 'bans', 'bans.type = :type', {type: "mute"})
			.getOne();

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

	async editVisibility(data: updateChatDTO): Promise<ChatDTO> {
		let chat: ChatEntity = await this.repo.findOne({
			where: {id: data.id}
		})
		if (!chat) {
			throw new HttpException("can't find chat", HttpStatus.NOT_FOUND);
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

}

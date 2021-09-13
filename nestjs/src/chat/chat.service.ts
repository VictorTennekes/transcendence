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

@Injectable()
export class ChatService {
	constructor(@InjectRepository(ChatEntity) private readonly repo: Repository<ChatEntity>,
				@InjectRepository(MessageEntity) private readonly msgRepo: Repository<MessageEntity>,
				@InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>) {}

	async getChatById(uuid: string): Promise<ChatDTO> {
		const item = await this.repo.findOne({
			where: {id: uuid},
			relations: ["users", "admins"]
		});
		// console.log("id: ", uuid);

		const msgs = (await this.getMessagesFromChat(uuid)).reverse();
		// query.

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
		// console.log("get chat by id return value");
		// console.log(ret);
		return toPromise(ret);
	}

	private getMatchingUsers(items: ChatEntity[], users: UserDTO[]) {
		let item;
		for (let i = 0; i < items.length; i++) {
			// Logger.log(`${JSON.stringify(items[i])}`);
			let count = 0;
			for (let j = 0; j < users.length; j++) {
				if (users.length === 1) {
					if (items[i].users.length === 1
						&& users.length === 1
						&& items[i].users[0].intra_name === users[0].intra_name) {
						// Logger.log("found matching item");
						item = items[i];
						return item;
					}
				} else {
					// function userExists(username) {
						// return items[i].users.some(function(el) {
							// return el.intra_name === username;
						// });
					// }
					if (this.userExists(users[j].intra_name, items[i].users)) {
						// Logger.log(`found ${count} === ${users.length}`);
						count++;
					}
					if (count == users.length) {
						item = items[i];
						// Logger.log(`item: ${JSON.stringify(item)}`);
						// Logger.log(`items[i]: ${JSON.stringify(items[i])}`);
						// Logger.log(`hereee`);
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
		// console.log("items is:");
		// console.log(chats);

		for (let chat in chats) {
			// console.log(chat);
			chats[chat] = await this.repo
					.createQueryBuilder('chat')
					.leftJoinAndSelect('chat.users', 'users')
					.where('chat.id = :id', {id: chats[chat].id})
					.getOne();
			// console.log(chats[chat]);
		}
		// console.log(chats);
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
		//TODO: in the future, display a list of matching chats for multiuser chats.

		let item = this.getMatchingUsers(items, users);

		if (!item) {
			// Logger.log("can't find chat");
			return null;
			// throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
		}
		Logger.log(`chat id: ${item.id}`);
		const ret: ChatDTO = {
			id: item.id,
			name: item.name,
			visibility: item.visibility,
			admins: item.admins,
			users: item.users,
			messages: item.messages
		}
		// Logger.log(`chat users: ${item.users}`)
		return toPromise(ret);

	}

	async getChatByName(name: string, username: string): Promise<ChatDTO[]> {
		// Logger.log(`getting chats: ${name}`);
		// console.log(await this.repo.find());

		// Logger.log(`name: ${name}, username: ${username}`);

		let chats = await this.repo
		.createQueryBuilder("chat")
		.innerJoinAndSelect("chat.users", "users")
		.where("chat.name = :name", {name})
		.andWhere("(chat.visibility != 'private' OR users.intra_name = :username)", {username})
		.getMany()

		// console.log("getChatByName result:");
		// console.log(chats)
		// return chats;
		return toPromise(chats);
	}

	async createNewChat(newChat: NewChatDTO): Promise<ChatDTO> {
		// Logger.log("creating a new chat");
		// console.log(newChat);
		let item: ChatEntity = await this.repo.create({
			name: newChat.name,
			users: newChat.users,
			visibility: newChat.visibility,
			admins: newChat.admins,
			password: newChat.password
		});
		item = await this.repo.save(item);
		// Logger.log("saved");
		// console.log(item);
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
		Logger.log(newMessage.owner);
		Logger.log(newMessage.message);
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
		// Logger.log(`id: ${id}`);
		// Logger.log(`get messages from chat`);
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
			// console.log("not finding chat, throw");
			throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
		}
		return items;
	}

	async validatePassword(pass: string, chatId: string): Promise<boolean> {
		const chat = await this.repo.findOne({where: {
			id: chatId
		}})
		// console.log(chat);

		let val = toPromise(bcrypt.compareSync(pass, chat.password));
		return toPromise(val);
	}

	async userCanAccessChat(username: string, chatId: string):  Promise<boolean>{
		const chat = await this.getChatById(chatId);
		if (chat.visibility !== 'public') {
			// function userExists(username) {
				// return chat.users.some(function(el) {
					// return el.intra_name === username;
				// });
			// }
			if (this.userExists(username, chat.users)) {
				// console.log('yes');
				return true;
				// return "OK";
			} else if (chat.visibility === 'protected'){
				// console.log("exception");
				throw new HttpException("User has no rights ", HttpStatus.FORBIDDEN);
				// return "protected";
			} else if (chat.visibility === 'private' || chat.visibility === 'direct') {
				throw new HttpException("this is a private chat", HttpStatus.UNAUTHORIZED);
				// return "private";
			}
		} else {
			// return "OK";
			return true;
		}
	}

	private userExists(username: string, users: UserDTO[]) {
			return users.some(function(el) {
				return el.intra_name === username;
			});
		}


	async addUserToChat(id: string, user: UserDTO): Promise<ChatDTO> {
		console.log("adding user to chat");
		console.log(id);
		let chat: ChatEntity = await this.repo.findOne({
			where: {id: id},
			relations: ["users"]
		});
		console.log("chat found:");
		console.log(chat);
		// function userExists(username) {
			// return chat.users.some(function(el) {
				// return el.intra_name === username;
			// });
		// }
		
		if (!this.userExists(user.intra_name, chat.users)) {
			chat.users.push(user);
			const lol = await this.repo.manager.save(chat);
			console.log("saved");
			console.log(lol);
			return lol;
			// const lol: Promise<ChatDTO> = this.repo.save(chat);
			// const lol: Promise<ChatDTO> = this.repo.update({
				// id
			// }, {
				
			// })
			// console.log("lol");
			// console.log(lol);
			// return lol;
			//TODO: do i send a response based on if something was updated or not?
			
		}

		// await this.repo
			// .update({ id: id }, newUserData)
			// .then(r => {
			// return res.status(204).send();
			// })
			// .catch(err => {
			// logger.error(err);
			// return res.status(500).json({ error: "Error." });
		// });

		// await this.repo
			// .createQueryBuilder("chat")
			// .relation("users")//check
			// .update()
			// .set({users: user})
		

	}

}

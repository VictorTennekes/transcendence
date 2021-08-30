import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { toPromise } from "@shared/utils";
import { ChatDTO } from "@chat/dto/chat.dto";
import { NewChatDTO } from "@chat/dto/newChat.dto";
import { ChatEntity } from "@chat/entity/chat.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MessageDTO, randomsgDTO } from "@chat/dto/message.dto";
import { MessageEntity } from "@chat/entity/message.entity";
import { UserDTO } from "@user/dto/user.dto";

@Injectable()
export class ChatService {
	constructor(@InjectRepository(ChatEntity) private readonly repo: Repository<ChatEntity>,
				@InjectRepository(MessageEntity) private readonly msgRepo: Repository<MessageEntity>) {}

	async getChatById(uuid: string): Promise<ChatDTO> {
		const item = await this.repo.findOne({
			where: {id: uuid},
			relations: ["users"]
		});
		if (!item) {
			throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
		}
		const ret: ChatDTO = {
			id: item.id,
			name: item.name,
			users: item.users,
			messages: item.messages
		}
		return toPromise(ret);
	}

	private getMatchingUsers(items: ChatEntity[], users: UserDTO[]) {
		let item;
		for (let i = 0; i < items.length; i++) {
			Logger.log(`${JSON.stringify(items[i])}`);
			let count = 0;
			for (let j = 0; j < users.length; j++) {
				if (users.length === 1) {
					if (items[i].users.length === 1 && items[i].users[0].intra_name === users[0].intra_name) {
						item = items[i];
						return item;
					}
				}
				function userExists(username) {
					return items[i].users.some(function(el) {
						return el.intra_name === username;
					});
				}
				if (userExists(users[j].intra_name)) {
					Logger.log(`found ${count} === ${users.length}`);
					count++;
				}
				if (count == users.length) {
					item = items[i];
					Logger.log(`item: ${JSON.stringify(item)}`);
					Logger.log(`items[i]: ${JSON.stringify(items[i])}`);
					Logger.log(`hereee`);
					return item;
				}
			}
		}
		return null;
	}

	async getChatByUsers(users: UserDTO[]): Promise<ChatDTO> {
		const items = await this.repo
				.createQueryBuilder("chat")
				.innerJoinAndSelect("chat.users", "users")
				.getMany();
		
		//TODO: in the future, display a list of matching chats for multiuser chats.

		let item = this.getMatchingUsers(items, users);

		if (!item) {
			Logger.log("can't find chat");
			throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
		}
		Logger.log(`chat id: ${item.id}`);
		const ret: ChatDTO = {
			id: item.id,
			name: item.name,
			users: item.users,
			messages: item.messages
		}
		Logger.log(`chat users: ${item.users}`)
		return toPromise(ret);

	}

	async createNewChat(newChat: NewChatDTO): Promise<ChatDTO> {
		Logger.log("creating a new chat");
		// Logger.log(newChat.users[0].intra_name);
		// Logger.log(newChat.users[1].intra_name);
		let item: ChatEntity = await this.repo.create({
			name: newChat.name,
			users: newChat.users
		});
		
		// Logger.log(item.users[0].intra_name);
		// Logger.log(item.users[1].intra_name);
		item = await this.repo.save(item);
		Logger.log("saved");
		const ret: ChatDTO = {
			id: item.id,
			name: item.name,
			users: item.users,
			messages: item.messages
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

	async createNewMessageSocket(message: string, owner: UserDTO, chat: ChatDTO): Promise<MessageDTO> {
		// const { message } = newMessage;
		// Logger.log(newMessage.owner);
		// Logger.log(newMessage.message);
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
		Logger.log(`id: ${id}`);
		Logger.log(`get messages from chat`);
		const item = await this.msgRepo.find({
			where: {chat: id},
			relations: ["owner"],
			order: {
				time: "ASC"
			}
		});
		if (!item) {
			throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
		}
		return item;
	}
}

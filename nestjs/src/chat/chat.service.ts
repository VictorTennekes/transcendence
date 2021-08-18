import { HttpException, HttpStatus, Injectable, Logger, Req } from "@nestjs/common";
import { toPromise } from "@shared/utils";
import { chatDTO } from "@chat/dto/chat.dto";
import { newChatDTO } from "@chat/dto/newChat.dto";
import { chatEntity } from "@chat/entity/chat.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MessageDTO } from "@chat/dto/message.dto";
import { newMessageDTO } from "@chat/dto/newMessage.dto";
import { MessageEntity } from "@chat/entity/message.entity";
import { SessionSerializer } from "src/auth/session.serializer";
import { UserDTO } from "@user/dto/user.dto";

@Injectable()
export class chatService {
    constructor(@InjectRepository(chatEntity) private readonly repo: Repository<chatEntity>,
                @InjectRepository(MessageEntity) private readonly msgRepo: Repository<MessageEntity>) {}

    async getChatById(uuid: string): Promise<chatDTO> {
        const item = await this.repo.findOne({
            where: {id: uuid}
        });
        if (!item) {
            throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
        }
        const ret: chatDTO = {
            id: item.id,
            name: item.name,
            users: item.users,
            messages: item.messages
        }
        return toPromise(ret);
    }

    async getChatByUser(user: UserDTO): Promise<chatDTO> {
        Logger.log("getting chat by user");
        const item = await this.repo
            .createQueryBuilder("chat")
            .leftJoinAndSelect("chat.users", "users")
            .getOne();
        //TODO: find chat by two users, looked up user and user that looked up the other user
        Logger.log("got chat by user");
        if (!item) {
            throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
        }
        const ret: chatDTO = {
            id: item.id,
            name: item.name,
            users: item.users,
            messages: item.messages
        }
        Logger.log(`chat users: ${item.users}`)
        return toPromise(ret);

    }

    async createNewChat(newChat: newChatDTO): Promise<chatDTO> {
        const { name, users } = newChat;
        Logger.log("creating a new chat");
        const item: chatEntity = await this.repo.create({
            name,
            users
        });
        Logger.log("about to save new chat");
        await this.repo.save(item);
        Logger.log("successfully saved new chat");
        const ret: chatDTO = {
            id: item.id,
            name: item.name,
            users: item.users,
            messages: item.messages
        }
        return toPromise(ret);
    }

    async createNewMessage(newMessage: newMessageDTO): Promise<MessageDTO> {
        const {owner, message, chat} = newMessage;
        Logger.log(newMessage.owner);
        Logger.log(newMessage.message);
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
        const item = await this.msgRepo.find({
            where: {chat: id},
        });
        if (!item) {
            throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
        }
        return item;
    }
}

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

    async getChatByUsers(users: UserDTO[]): Promise<chatDTO> {
        Logger.log("getting chat by user");
        const item = await this.repo
                .createQueryBuilder("chat")
                .innerJoinAndSelect("chat.users", "users")
                .where("users.intra_name = :username", { username: [users[0].intra_name, users[1].intra_name] })
                .getOne()
        Logger.log("got chat by user");
        if (!item) {
            throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
        }
        Logger.log(`chat id: ${item.id}`);
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
        Logger.log("creating a new chat");
        let item: chatEntity = await this.repo.create({
            name: newChat.name,
            users: newChat.users
        });
        item = await this.repo.save(item);
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

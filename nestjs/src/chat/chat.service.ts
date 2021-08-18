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
            user: item.user,
            messages: item.messages
        }
        return toPromise(ret);
    }

    async getChatByUser(username: string): Promise<chatDTO> {
        
        const item = await this.repo.findOne({
            where: {user: username}
        });
        if (!item) {
            throw new HttpException("can't find chat", HttpStatus.BAD_REQUEST,);
        }
        const ret: chatDTO = {
            id: item.id,
            name: item.name,
            user: item.user,
            messages: item.messages
        }
        return toPromise(ret);
    }

    async createNewChat(newChat: newChatDTO): Promise<chatDTO> {
        const { name, user } = newChat;
        const item: chatEntity = await this.repo.create({
            name,
            user
        });
        await this.repo.save(item);
        const ret: chatDTO = {
            id: item.id,
            name: item.name,
            user: item.user,
            messages: item.messages
        }
        return toPromise(ret);
    }

    async createNewMessage(newMessage: newMessageDTO): Promise<MessageDTO> {
        // this.session.deserializeUser();

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
        // const chat: Promise<chatDTO> = this.getChatById(id);
        //TODO: this exception should fall through anyway
        // Logger.log(chat);
       // return (chat.messages);
        // const messages: messageDTO[] = await this.repo.find({
            // where: {id: id},
            // select: ["messages"]
        // })
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

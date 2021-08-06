import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { toPromise } from "@shared/utils";
import { chatDTO } from "@chat/dto/chat.dto";
import { newChatDTO } from "@chat/dto/newChat.dto";
import { chatEntity } from "@chat/entity/chat.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MessageDTO } from "@chat/dto/message.dto";
import { newMessageDTO } from "@chat/dto/newMessage.dto";
import { MessageEntity } from "@chat/entity/message.entity";

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
            name: item.name
        }
        return toPromise(ret);
    }

    async createNewChat(newChat: newChatDTO): Promise<chatDTO> {
        const { name } = newChat;
        const item: chatEntity = await this.repo.create({
            name
        });
        await this.repo.save(item);
        const ret: chatDTO = {
            id: item.id,
            name: item.name
        }
        return toPromise(ret);
    }

    async createNewMessage(newMessage: newMessageDTO): Promise<newMessageDTO> {
        const {owner, message} = newMessage;
        Logger.log(newMessage.owner);
        Logger.log(newMessage.message);
        const item: MessageEntity = await this.msgRepo.create({
            owner,
            message
        });
        await this.msgRepo.save(item);
        const ret: MessageDTO = {
            id: item.id,
            time: item.time,
            owner: item.owner,
            message: item.message
        }
        return toPromise(ret);
    }
}

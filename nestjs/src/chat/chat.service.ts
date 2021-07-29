import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { toPromise } from "@shared/utils";
import { chatDTO } from "@chat/dto/chat.dto";
import { newChatDTO } from "@chat/dto/newChat.dto";
import { chatEntity } from "@chat/entity/chat.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class chatService {
    constructor(@InjectRepository(chatEntity) private readonly repo: Repository<chatEntity>) {}

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
}

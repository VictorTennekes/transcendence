import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { chatService } from '@chat/chat.service';
import { chatDTO } from '@chat/dto/chat.dto';
import { newChatDTO } from '@chat/dto/newChat.dto';
import { toPromise } from '@shared/utils';

@Controller('api/chat')
export class ChatController {
    constructor(private readonly service: chatService) {}
    @Get(":id")
    async getChatByName(@Param("id") id: string): Promise<chatDTO> {
        const item = await this.service.getChatById(id);
        return toPromise(item);
    }
    @Post()
    async createNewChat(@Body() newChat: newChatDTO): Promise<chatDTO> {
        return await this.service.createNewChat(newChat);
    }
    
}

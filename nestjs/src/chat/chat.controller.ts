import { Body, Controller, Get, Logger, Param, ParseUUIDPipe, Post, UseGuards, Req } from '@nestjs/common';
import { chatService } from '@chat/chat.service';
import { chatDTO } from '@chat/dto/chat.dto';
import { newChatDTO } from '@chat/dto/newChat.dto';
import { toPromise } from '@shared/utils';
import { MessageDTO } from '@chat/dto/message.dto';
import { MsgDTO, newMessageDTO } from '@chat/dto/newMessage.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

@Controller('chat')
export class ChatController {
    constructor(private readonly service: chatService) {}
    // @Get(":id")
    // async getChatById(@Param("id", new ParseUUIDPipe()) uuid: string): Promise<chatDTO> {
        // const item = await this.service.getChatById(uuid);
        // return toPromise(item);
    // }
    // @Post()
    // async createNewChat(@Body() newChat: newChatDTO): Promise<chatDTO> {
        // return await this.service.createNewChat(newChat);
    // }
    @Post()
    async createNewMessage(@Body() newMessage: MsgDTO, @Req() req): Promise<MessageDTO> {
        Logger.log(newMessage);
        let msg: newMessageDTO = {
            owner: req.session.passport.user.intra_name,
            message: newMessage.message
        };
        Logger.log("chat controller nest");
        Logger.log(msg.message);
        Logger.log(msg.owner);
        return await this.service.createNewMessage(msg);
    }

    @Get()
    async getAllMessages(): Promise<MessageDTO[]> {
        return await this.service.getAllMessages();
    }
    
}

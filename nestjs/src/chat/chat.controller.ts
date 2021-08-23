import { Body, Controller, Get, Logger, Param, Post, UseGuards, Req, HttpException, HttpStatus, UseFilters } from '@nestjs/common';
import { chatService } from '@chat/chat.service';
import { chatDTO } from '@chat/dto/chat.dto';
import { newChatDTO, receiveNewChatDTO } from '@chat/dto/newChat.dto';
import { MessageDTO } from '@chat/dto/message.dto';
import { newMessageDTO, receiveMessageDTO } from '@chat/dto/newMessage.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { UserService } from '@user/user.service';
import { UserDTO } from '@user/dto/user.dto';
import { UnauthorizedFilter } from 'src/auth/unauthorized.filter';

@Controller('chat')
export class ChatController {
    constructor(private readonly service: chatService,
                private readonly userService: UserService) {}
    // @Get(":id")
    // async getChatById(@Param("id", new ParseUUIDPipe()) uuid: string): Promise<chatDTO> {
    //     const item = await this.service.getChatById(uuid);
    //     return toPromise(item);
    // }

    @Get("find/:user")
    @UseGuards(AuthenticatedGuard)
    @UseFilters(UnauthorizedFilter)
    async getChatById(@Param("user") username: string, @Req() req): Promise<chatDTO> {
        Logger.log(`Finding user ${username}`);
        // let users: string[];
        // users.push(username);
        // users.push(req.session.passport.user.intra_name);
        const user = await this.userService.findOne(username);
        if (user) {
            Logger.log("found user");
            // return await this.service.getChatByUser(username);
            let users: UserDTO[] = [];
            users.push(user);
            users.push(await this.userService.findOne(req.session.passport.user.intra_name));
            return await this.service.getChatByUsers(users);
        } else {
            Logger.log("can't find user");
            throw new HttpException("No user by name " + username, HttpStatus.NOT_FOUND);
        }
    }

    @Post('new')
    async createNewChat(@Body() newChat: receiveNewChatDTO, @Req() req): Promise<chatDTO> {
        Logger.log(`Creating new chat`);
        let user: UserDTO = await this.userService.findOne(req.session.passport.user.intra_name);
        Logger.log(`${newChat.user}`);
        // newChat.users.push(user);
        let nc: newChatDTO = {
            name: newChat.name,
            users: []
        }
        nc.users.push(user);
        user = await this.userService.findOne(newChat.user);
        nc.users.push(user);
        return await this.service.createNewChat(nc);
    }

    // @Post("chat_by_user")
    // async findExistingOrCreateNew(@Body() newChat: chatDTO, @Req() req): Promise<chatDTO> {
// 
    // }
    // @Post()
    // async createNewChat(@Body() newChat: newChatDTO): Promise<chatDTO> {
        // return await this.service.createNewChat(newChat);
    // }
    @Post('msg')
    async createNewMessage(@Body() newMessage: receiveMessageDTO, @Req() req): Promise<MessageDTO> {
        Logger.log(newMessage);
        Logger.log(newMessage);
        //if there isn't a session, then use a placeholder user.
        //or create a session for random user with login
        let msgOwner: UserDTO = await this.userService.findOne(req.session.passport.user.intra_name);
        let chat: chatDTO = await this.service.getChatById(newMessage.chat);
        let msg: newMessageDTO = {
            owner: msgOwner,
            message: newMessage.message,
            chat: chat
        };
        Logger.log("chat controller nest");
        Logger.log(msg.message);
        Logger.log(msg.owner);
        return await this.service.createNewMessage(msg);
    }
}

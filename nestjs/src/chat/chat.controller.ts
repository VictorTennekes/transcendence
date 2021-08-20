import { Body, Controller, Get, Logger, Param, ParseUUIDPipe, Post, UseGuards, Req, HttpException, HttpStatus, UseFilters } from '@nestjs/common';
import { ChatService } from '@chat/chat.service';
import { ChatDTO } from '@chat/dto/chat.dto';
import { NewChatDTO } from '@chat/dto/newChat.dto';
import { toPromise } from '@shared/utils';
import { MessageDTO } from '@chat/dto/message.dto';
import { MsgDTO, newMessageDTO } from '@chat/dto/newMessage.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { UserService } from '@user/user.service';
import { UserDTO } from '@user/dto/user.dto';
import { UserEntity } from '@user/entities/user.entity';
import { UnauthorizedFilter } from 'src/auth/unauthorized.filter';

@Controller('chat')
export class ChatController {
	constructor(
		private readonly service: ChatService,
		private readonly userService: UserService
	) {}

	// @Get(":id")
	// async getChatById(@Param("id", new ParseUUIDPipe()) uuid: string): Promise<ChatDTO> {
	//     const item = await this.service.getChatById(uuid);
	//     return toPromise(item);
	// }
	@Get("find/:user")
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async getChatById(@Param("user") username: string): Promise<ChatDTO> {
		Logger.log(`Finding user ${username}`);
		const user = await this.userService.findOne(username);
		if (user) {
			Logger.log("found user");
			// return await this.service.getChatByUser(username);
			return await this.service.getChatByUser(user);
		} else {
			Logger.log("can't find user");
			throw new HttpException("No user by name " + username, HttpStatus.NOT_FOUND);
		}
	}
	@Post('new')
	async createNewChat(@Body() newChat: ChatDTO, @Req() req): Promise<ChatDTO> {
		Logger.log(`Creating new chat`);
		return await this.service.createNewChat(newChat);
	}
	// @Post()
	// async createNewChat(@Body() newChat: NewChatDTO): Promise<ChatDTO> {
	// return await this.service.createNewChat(newChat);
	// }
	@Post('msg')
	async createNewMessage(@Body() newMessage: MsgDTO, @Req() req): Promise<MessageDTO> {
		Logger.log(newMessage);
		Logger.log(newMessage);
		//if there isn't a session, then use a placeholder user.
		//or create a session for random user with login
		let msg: newMessageDTO = {
			owner: req.session.passport.user.intra_name,
			message: newMessage.message,
			chat: newMessage.chat
		};
		Logger.log("chat controller nest");
		Logger.log(msg.message);
		Logger.log(msg.owner);
		return await this.service.createNewMessage(msg);
	}
	
	// @Get('msg')
	// async getAllMessages(): Promise<MessageDTO[]> {
	// return await this.service.getAllMessages();
	// }
	@Get('msg/:id')
	async getMessagesFromChat(@Param("id") id: string): Promise<MessageDTO[]> {
		return await this.service.getMessagesFromChat(id);
	}
}

import { Body, Controller, Get, Logger, Param, Post, UseGuards, Req, HttpException, HttpStatus, UseFilters } from '@nestjs/common';
import { ChatService } from '@chat/chat.service';
import { ChatDTO } from '@chat/dto/chat.dto';
import { NewChatDTO, ReceiveNewChatDTO } from '@chat/dto/newChat.dto';
import { MessageDTO } from '@chat/dto/message.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { UserService } from '@user/user.service';
import { UserDTO } from '@user/dto/user.dto';
import { UnauthorizedFilter } from 'src/auth/unauthorized.filter';

@Controller('chat')
export class ChatController {
	constructor(private readonly service: ChatService,
				private readonly userService: UserService) {}

	@Get("find/:user")
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async getChatById(@Param("user") username: string, @Req() req): Promise<ChatDTO> {
		const user = await this.userService.findOne(username);
		if (user) {
			let users: UserDTO[] = [];
			users.push(user);
			Logger.log("after push");
			if (username !== req.session.passport.user.intra_name) {
				users.push(await this.userService.findOne(req.session.passport.user.intra_name));
			}
			Logger.log("about to return");
			return await this.service.getChatByUsers(users);
		} else {
			throw new HttpException("No user by name " + username, HttpStatus.NOT_FOUND);
		}
	}

	@Post('new')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async createNewChat(@Body() newChat: ReceiveNewChatDTO, @Req() req): Promise<ChatDTO> {
		Logger.log(`Creating new chat`);
		let user: UserDTO = await this.userService.findOne(req.session.passport.user.intra_name);
		Logger.log(`${newChat.user}`);
		let nc: NewChatDTO = {
			name: newChat.name,
			users: []
		}
		Logger.log(`users ${user.intra_name}`);
		nc.users.push(user);
		user = await this.userService.findOne(newChat.user);
		if (user.intra_name !== nc.users[0].intra_name) {
			Logger.log(`users ${user.intra_name}`);
			nc.users.push(user);
		}
		return await this.service.createNewChat(nc);
	}

	@Get('msg/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
    async getMessagesFromChat(@Param("id") id: string): Promise<MessageDTO[]> {
        return await this.service.getMessagesFromChat(id);
    }
}

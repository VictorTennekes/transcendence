import { Body, Controller, Get, Logger, Param, Post, UseGuards, Req, HttpException, HttpStatus, UseFilters } from '@nestjs/common';
import { ChatService } from '@chat/chat.service';
import { ChatDTO } from '@chat/dto/chat.dto';
import { NewChatDTO, ReceiveNewChatDTO } from '@chat/dto/newChat.dto';
import { MessageDTO } from '@chat/dto/message.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { UserService } from '@user/user.service';
import { UserDTO } from '@user/dto/user.dto';
import { UnauthorizedFilter } from 'src/auth/unauthorized.filter';

class validatePassDTO {
	pass: string;
	chatId: string;
}

@Controller('chat')
export class ChatController {
	constructor(private readonly service: ChatService,
				private readonly userService: UserService) {}

	@Get()
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async getAllChats(@Req() req): Promise<ChatDTO[]> {
		return this.service.getAllChatsByUser(req.session.passport.user.intra_name);
	}

	// @Get("find/:user")
	// @UseGuards(AuthenticatedGuard)
	// @UseFilters(UnauthorizedFilter)
	// async getChatById(@Param("user") username: string, @Req() req): Promise<ChatDTO> {
	// 	const user = await this.userService.findOne(username);
	// 	if (user) {
	// 		Logger.log("find/:user, found a user")
	// 		let users: UserDTO[] = [];
	// 		users.push(user);
	// 		if (username !== req.session.passport.user.intra_name) {
	// 			users.push(await this.userService.findOne(req.session.passport.user.intra_name));
	// 		}
	// 		return await this.service.getChatByUsers(users);
	// 	} else {
	// 		throw new HttpException("No user by name " + username, HttpStatus.NOT_FOUND);
	// 	}
	// }

	@Get("find/:name")
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async getChatById(@Param("name") name: string, @Req() req): Promise<ChatDTO[]> {
		let chats: ChatDTO[] = await this.service.getChatByName(name, req.session.passport.user.intra_name);
		const user = await this.userService.findOne(name);
		if (user) {
			Logger.log("find/:name, found a user")
			let users: UserDTO[] = [];
			users.push(user);
			if (name !== req.session.passport.user.intra_name) {
				users.push(await this.userService.findOne(req.session.passport.user.intra_name));
			}
			// return await this.service.getChatByUsers(users);
			let dm = await this.service.getChatByUsers(users);
			if (!dm) {
				let chatdto: NewChatDTO = {
					name: "",
					visibility: "direct",
					admins: [],
					users: users,
					password: ""
				};
				dm = await this.service.createNewChat(chatdto);
			}
			chats.push(dm);
			console.log(chats);
		}
		if (!chats) {
			throw new HttpException("No chat by name " + name, HttpStatus.NOT_FOUND);
		}
		return chats;
	}
	
	@Post('get')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async createDirectChat(@Body() newChat: ReceiveNewChatDTO, @Req() req): Promise<ChatDTO> {
	// async getOrCreateChat(@Body() newChat: ReceiveNewChatDTO, @Req() req): Promise<ChatDTO> {
		let user: UserDTO = await this.userService.findOne(req.session.passport.user.intra_name);
		Logger.log(`${newChat.users}`);
		let nc: NewChatDTO = {
			name: newChat.name,
			visibility: newChat.visibility,
			users: [],
			admins: [],
			password: newChat.password
		}
		nc.users.push(user);
		user = await this.userService.findOne(newChat.users[0]);//TODO: do this in a loop for the whole array
		if (user.intra_name !== nc.users[0].intra_name) {
			Logger.log("a different user found")
			nc.users.push(user);
		}
		return await this.service.createNewChat(nc);
	}

	@Post('new')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async createNewChat(@Body() newChat: ReceiveNewChatDTO, @Req() req): Promise<ChatDTO> {
		console.log("create new chat");
		console.log(newChat);	
		console.log("that was new chat");
		let user = await this.userService.findOne(req.session.passport.user.intra_name);
		let nc: NewChatDTO = {
			name: newChat.name,
			visibility: newChat.visibility,
			users: [],
			admins: [],
			password: newChat.password
		}
		nc.users.push(user);
		nc.admins.push(user);
		for (let usr of newChat.users) {
			console.log("user in array");
			console.log(usr);
			let item = await this.userService.findOne(usr);
			if (item) {
				nc.users.push(item);
			}
			//TODO: do i error if i cant find a user?
		}
		return await this.service.createNewChat(nc);
	}

	@Get('msg/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
    async getMessagesFromChat(@Param("id") id: string): Promise<MessageDTO[]> {
        return await this.service.getMessagesFromChat(id);
    }


	@Post('validate-pass')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async validatePassword(@Body() body: validatePassDTO): Promise<boolean> {
		Logger.log("validate password");
		console.log(body);
		return this.service.validatePassword(body.pass, body.chatId);
	}
}

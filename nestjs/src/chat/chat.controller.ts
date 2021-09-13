import { Body, Controller, Get, Logger, Param, Post, UseGuards, Req, HttpException, HttpStatus, UseFilters } from '@nestjs/common';
import { ChatService } from '@chat/chat.service';
import { ChatDTO } from '@chat/dto/chat.dto';
import { NewChatDTO, ReceiveNewChatDTO } from '@chat/dto/newChat.dto';
import { MessageDTO } from '@chat/dto/message.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { UserService } from '@user/user.service';
import { UserDTO } from '@user/dto/user.dto';
import { UnauthorizedFilter } from 'src/auth/unauthorized.filter';
import { toPromise } from '@shared/utils';

class validatePassDTO {
	pass: string;
	chatId: string;
}

// import * as rawbody from 'raw-body';
// import { createParamDecorator } from '@nestjs/common';

// export const PlainBody = createParamDecorator(async (data, req) => {
//   if (req.readable) {
//     return (await rawbody(req)).toString().trim();
//   }
//   throw new HttpException('Body aint text/plain', HttpStatus.INTERNAL_SERVER_ERROR);
// });


@Controller('chat')
export class ChatController {
	constructor(private readonly service: ChatService,
				private readonly userService: UserService) {}

	@Get()
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async getAllChats(@Req() req): Promise<ChatDTO[]> {
		return this.service.getAllChatsByUser(req.session.passport.user.login);
	}

	@Get("find/:name")
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async getChatById(@Param("name") name: string, @Req() req): Promise<ChatDTO[]> {
		let chats: ChatDTO[] = await this.service.getChatByName(name, req.session.passport.user.login);
		const user = await this.userService.findOne(name);
		if (user) {
			// Logger.log("find/:name, found a user")
			let users: UserDTO[] = [];
			users.push(user);
			if (name !== req.session.passport.user.login) {
				users.push(await this.userService.findOne(req.session.passport.user.login));
			}
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
			// console.log(chats);
		}
		if (!chats) {
			throw new HttpException("No chat by name " + name, HttpStatus.NOT_FOUND);
		}
		return chats;
	}

	@Get("get-chat/:id")
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async getChatByIdTwo(@Param("id") id: string) {
		return await this.service.getChatById(id);
	}
	
	@Post('get')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async createDirectChat(@Body() newChat: ReceiveNewChatDTO, @Req() req): Promise<ChatDTO> {
		let user: UserDTO = await this.userService.findOne(req.session.passport.user.login);
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
		// console.log("create new chat");
		// console.log(newChat);	
		// console.log("that was new chat");
		// console.log(req.session.passport);
		// console.log(req.session.passport.user.login);
		let user = await this.userService.findOne(req.session.passport.user.login);
		// console.log(user);
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
			// console.log("user in array");
			// console.log(usr);
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
		// console.log(body);
		return this.service.validatePassword(body.pass, body.chatId);
	}

	@Get('can-access/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async userCanAccessChat(@Param("id") id: string, @Req() req): Promise<boolean> {
		// console.log("can i access?");
		// console.log(id);
		// console.log(req.user);
		// const user: UserDTO = await this.userService.findOne(req.user.intra_name);
		return this.service.userCanAccessChat(req.user.intra_name, id);
		// const user = await this.userService.findOne(req.session.passport.user.login);
		// return this.service.userCanAccessChat(req.session.passport.user)
		// return toPromise(false);
		// throw new HttpException

		// throw new HttpException("No chat by name ", HttpStatus.NOT_FOUND);
	}

	// @Get("get-chat/:id")
	// @UseGuards(AuthenticatedGuard)
	// @UseFilters(UnauthorizedFilter)
	// async getChatByIdTwo(@Param("id") id: string) {
		// return await this.service.getChatById(id);
	// }


	@Post('add-user')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async addUserToChat(@Body() id: ChatDTO, @Req() req): Promise<ChatDTO> {
		console.log("add to chat");
		console.log(id);
		const user: UserDTO = await this.userService.findOne(req.user.intra_name);
		console.log(user);
		console.log(id.id);
		console.log("aaa come onn");
		return this.service.addUserToChat(id.id, user);
	}

}

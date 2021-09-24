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

export class updateUsersDTO {
	chatId: string;
	users: string[];
}


export class updateChatDTO {
	id: string;
	admin: string;
	bannedUser: string;
	bannedTime: Date;
	banType: string;
	visibility: string;
	password: string;
}

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
		//TODO: when searching for a dm, a dm is not created, but it finds chat's by the user
		let chats: ChatDTO[] = await this.service.getChatByName(name, req.session.passport.user.login);
		const user = await this.userService.findOne(name);
		if (user) {
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
		}
		if (!chats || chats.length < 1) {
			console.log('no chats');
			throw new HttpException("No chat by name " + name, HttpStatus.NOT_FOUND);
		}
		console.log("returning these chats");
		console.log(chats);
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
		let user = await this.userService.findOne(req.session.passport.user.login);
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
		return this.service.validatePassword(body.pass, body.chatId);
	}

	@Get('can-access/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async userCanAccessChat(@Param("id") id: string, @Req() req): Promise<boolean> {
		return this.service.userCanAccessChat(req.user.intra_name, id);
	}

	@Post('add-user')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async addUserToChat(@Body() id: ChatDTO, @Req() req): Promise<ChatDTO> {
		const user: UserDTO = await this.userService.findOne(req.user.intra_name);
		return this.service.addUserToChat(id.id, user);
	}

	@Post('update-admins')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async updateAdmins(@Body() admins: updateChatDTO) {
		return this.service.updateAdmins(admins);
	}

	@Post('add-ban')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async addBan(@Body() data: updateChatDTO) {
		console.log("add ban");
		console.log(typeof data.bannedTime)
		console.log(typeof data.bannedTime.getTime === 'function')
		data.bannedTime = new Date(data.bannedTime)
		console.log(typeof data.bannedTime)
		console.log(typeof data.bannedTime.getTime === 'function')
		return this.service.addBannedUser(data);
	}

	@Post('add-mute')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async addMute(@Body() data: updateChatDTO) {
		data.bannedTime = new Date(data.bannedTime)
		return this.service.addMutedUser(data);
	}

	@Post('edit-visibility')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async editVisibility(@Body() data: updateChatDTO) {
		return this.service.editVisibility(data);
	}

	@Get('user-is-admin/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async userIsAdmin(@Param("id") id: string, @Req() req): Promise<boolean> {
		return this.service.userIsAdmin(id, req.user.intra_name);
	}
	@Get('user-in-chat/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async userInChat(@Param("id") id: string, @Req() req): Promise<boolean> {
		return this.service.userInChat(req.user.intra_name, id);
	}

}

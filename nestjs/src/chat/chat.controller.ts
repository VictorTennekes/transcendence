import { Body, Controller, Get, Param, Post, UseGuards, Req, HttpException, HttpStatus, UseFilters } from '@nestjs/common';
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
	bannedTime: string;
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
	async findChatByName(@Param("name") name: string, @Req() req): Promise<ChatDTO[]> {
		let chats: ChatDTO[] = await this.service.getChatByName(name, req.session.passport.user.login);
		const user = await this.userService.findOne(name);
		if (user) {
			let users: UserDTO[] = [];
			users.push(user);
			//add the calling user to Users array
			if (name !== req.session.passport.user.login) {
				users.push(await this.userService.findOne(req.session.passport.user.login));
			}
			let dm = await this.service.getChatByUsers(users);
			if (!dm) {
				let chatdto: NewChatDTO = {
					name: `DM ${users[0].intra_name}`,
					visibility: "direct",
					owner: null,
					admins: [],
					users: users,
					password: ""
				};
				if (users.length > 1) {
					chatdto.name += ` & ${users[1].intra_name}`
				}
				dm = await this.service.createNewChat(chatdto);
			}
			chats.push(dm);
		}
		if (!chats || chats.length < 1) {
			throw new HttpException("No chat by name " + name, HttpStatus.NOT_FOUND);
		}
		return chats;
	}

	@Get("get-chat/:id")
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async getChatById(@Param("id") id: string, @Req() req) {
		return await this.service.getChatById(id, req.user.intra_name);
	}
	
	@Post('new')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async createNewChat(@Body() newChat: ReceiveNewChatDTO, @Req() req): Promise<ChatDTO> {
		let user = await this.userService.findOne(req.session.passport.user.login);
		let nc: NewChatDTO = {
			name: newChat.name,
			visibility: newChat.visibility,
			owner: user,
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
			} else {
				throw new HttpException("User " + usr + " not found", HttpStatus.NOT_FOUND);
			}
		}
		return await this.service.createNewChat(nc);
	}

	@Get('msg/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
    async getMessagesFromChat(@Param("id") id: string, @Req() req): Promise<MessageDTO[]> {
        return await this.service.getMessagesFromChat(id, req.user.intra_name);
    }

	@Post('validate-pass')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async validatePassword(@Body() body: validatePassDTO): Promise<boolean> {
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
	async updateAdmins(@Body() admins: updateChatDTO, @Req() req) {
		return this.service.updateAdmins(admins, req.user.intra_name);
	}

	@Post('add-ban')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async addBan(@Body() data: updateChatDTO, @Req() req) {
		return this.service.addBannedUser(data, req.user.intra_name);
	}

	@Post('add-mute')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async addMute(@Body() data: updateChatDTO, @Req() req) {
		return this.service.addMutedUser(data, req.user.intra_name);
	}

	@Post('edit-visibility')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async editVisibility(@Body() data: updateChatDTO, @Req() req) {
		return this.service.editVisibility(data, req.user.intra_name);
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

	@Get('is-logged-in-user/:username')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async isLoggedInUser(@Param("usernaem") username: string, @Req() req): Promise<boolean> {
		return (username === req.user.intra_name);
	}

	@Post('leave-chat')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async leaveChat(@Body() id: any, @Req() req) {
		await this.service.leaveChat(id.chatId, req.user.intra_name);
	}

	@Get('user-is-owner/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async userIsOwner(@Param("id") id: string, @Req() req): Promise<boolean> {
		return this.service.userIsOwner(id, req.user.intra_name);
	}
}

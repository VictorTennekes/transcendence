import { Logger, UseFilters, UseGuards } from "@nestjs/common";
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import { ConnectedSocket } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { UserService } from "@user/user.service";
import { parse } from 'cookie';
import { UserDTO } from "@user/dto/user.dto";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { UnauthorizedFilter } from "src/auth/unauthorized.filter";
import { MessageDTO, newMessageDTO } from "./dto/message.dto";

class socketData {
	user: UserDTO;
	socket: Socket;
}

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;

	constructor(private chatService: ChatService,
				private userService: UserService) {}

	connectedSockets: socketData[] = []

	async afterInit() {
		Logger.log("yo");
	}

	async getUserFromSocket(socket: Socket): Promise<UserDTO> {
		const cookie = socket.handshake.headers.cookie;
		if (!cookie) return null;
		const parsedCookie = parse(cookie);
		const cookieData = parsedCookie['connect.sid'];

		let sid = cookieData.substr(2, cookieData.indexOf(".") - 2);

		const postgresConnection = 
		{
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			host: process.env.POSTGRES_HOST,
			port: process.env.POSTGRES_PORT,
			database: process.env.POSTGRES_DB
		};
				
		const knex = require('knex')({
			client: 'pg',
			connection: postgresConnection,
		});

		const res = await knex.select("*").from("session");

		const otherRes = await knex("session").where("sid", sid);
		if (!otherRes) return null;
		if (!otherRes[0]) return null;
		if (!otherRes[0].sess) return null;
		if (!otherRes[0].sess.passport) return null;

		const user = otherRes[0].sess.passport.user;
		const sessUser = this.userService.findOne(user.login);
		return sessUser;
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		Logger.log("new connection");
		const user: UserDTO = await this.getUserFromSocket(client);
		if (!user) {
			Logger.log("something's wrong, can't find user")
			return;
		}
		console.log("Logging in ", user.intra_name);
		let newSocket: socketData = {
			user: user,
			socket: client
		};
		this.connectedSockets.push(newSocket);
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		Logger.log('disconnecting socket');
		const index = this.connectedSockets.findIndex(x => x.socket.id === client.id);
		this.connectedSockets.splice(index, 1);
	}


	@SubscribeMessage('send_message')
	async sendMessage(@ConnectedSocket() client: Socket, @MessageBody() message: newMessageDTO) {
		const chat = await this.chatService.getChatById(message.chat);
		const user = await this.getUserFromSocket(client);
		if (!user) {
			client.emit('send_message_error');
			return;
		}
		if (await this.chatService.userIsMuted(user, chat.id)) {
			client.emit('send_message_error');
			return;
		}
		const finalMsg: MessageDTO = await this.chatService.createNewMessageSocket(message.message, user, chat);
		for (let sock of this.connectedSockets) {
			if (chat.users.findIndex(x => x.intra_name === sock.user.intra_name) !== -1) {
				console.log("emitting receive messages");
				sock.socket.emit('receive_message', finalMsg);
			}
		}

	}

	@SubscribeMessage('request_message')
	async getMessages(@ConnectedSocket() client: Socket, chatId: string) {
		let messages = this.chatService.getMessagesFromChat(chatId);
		console.log("emitting send_msg messages");
		client.emit('send_messages_by_chatid', messages);
		
	}

}
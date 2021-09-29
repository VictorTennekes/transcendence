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
		// const sessUser = this.userService.findOne(user.login);
		const sessUser = this.userService.findUserWithBlocks(user.login);
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
		console.log("send msg");
		console.log(chat);
		console.log(user);
		let blockedByNames: string = "";
		for (let chatUser of chat.users) {
			if (this.chatService.userExists(chatUser.intra_name, user.blockedByUsers)) {
				console.log(chatUser.intra_name, " is blocked by ", chatUser.intra_name);
				blockedByNames += " " + chatUser.intra_name;
			}
		}
		if (blockedByNames !== "") {
			console.log("blocked by users:")
			console.log(blockedByNames);
			client.emit("send_message_error", "you are muted by" + blockedByNames + ". This message will not be shown to them");
		}
		if (!user) {
			client.emit('send_message_error', "no such user");
			return;
		}
		if (await this.chatService.userIsMuted(user, chat.id)) {
			client.emit('send_message_error', "you are muted");
			return;
		}
		const finalMsg: MessageDTO = await this.chatService.createNewMessageSocket(message.message, user, chat);
		for (let sock of this.connectedSockets) {
			console.log(sock.user);
			if (chat.users.findIndex(x => x.intra_name === sock.user.intra_name) !== -1) {
				if (blockedByNames !== "") {
					//TODO: if sock.user is blocked by chat.user, continue;
				}
				console.log("emitting receive messages to ", sock.user.intra_name);
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
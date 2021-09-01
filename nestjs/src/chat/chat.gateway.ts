import { Logger, UseFilters, UseGuards } from "@nestjs/common";
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import { ConnectedSocket } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { UserService } from "@user/user.service";
import { parse } from 'cookie';
// import * as session from 'express-session';
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

		Logger.log(`cookie: ${cookie}`)
		if (!cookie) return null;
		const parsedCookie = parse(cookie);
		Logger.log(`parsed cookie: ${JSON.stringify(parsedCookie)}`)
		const cookieData = parsedCookie['connect.sid'];
		Logger.log(JSON.stringify(cookieData));
		// let sessionData;

		let sid = cookieData.substr(2, cookieData.indexOf(".") - 2);

		// const postgresSession = require('connect-pg-simple')(session);

		// const fs = require('fs');
		// const path = require('path');

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
		Logger.log(JSON.stringify(res));

		const otherRes = await knex("session").where("sid", sid);
		// Logger.log(JSON.stringify(otherRes));
		// Logger.log(JSON.stringify(otherRes[0].sess.passport));
		if (!otherRes) return null;
		if (!otherRes[0].sess) return null;
		if (!otherRes[0].sess.passport) return null;
		Logger.log(JSON.stringify(otherRes));
		Logger.log(JSON.stringify(otherRes[0].sess.passport));

		const user = otherRes[0].sess.passport.user;
		Logger.log(user);


		//TODO: get this user from userService
		const sessUser = this.userService.findOne(user);

		// return sessUser;
		return user;
	}

	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async handleConnection(@ConnectedSocket() client: Socket) {
		Logger.log("new connection");
		const user: UserDTO = await this.getUserFromSocket(client);
		if (!user) return;
		let newSocket: socketData = {
			user: user,
			socket: client
		};
		this.connectedSockets.push(newSocket);
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		Logger.log('disconnecting socket');
		const index = this.connectedSockets.findIndex(x => x.socket.id === client.id);
		Logger.log(index);
		this.connectedSockets.splice(index, 1);
	}


	@SubscribeMessage('send_message')
	async sendMessage(@ConnectedSocket() client: Socket, @MessageBody() message: newMessageDTO) {
		Logger.log(`onChat, message received: ${message}`);
		const chat = await this.chatService.getChatById(message.chat);
		const user = await this.getUserFromSocket(client);
		const finalMsg: MessageDTO = await this.chatService.createNewMessageSocket(message.message, user, chat);
		for (let sock of this.connectedSockets) {
			console.log(sock.user);
			if (chat.users.findIndex(x => x.intra_name === sock.user.intra_name) !== -1) {
				Logger.log(`sending a message to ${JSON.stringify(sock.user)}`)
				sock.socket.emit('receive_message', finalMsg);
			}
		}

	}

	// TODO: refactor so that communications take place solely through chat.gateway.
	// TODO: Frontend shouldn't do any of the work. Dates should be generated and users should be identified here in the backend
	@SubscribeMessage('request_message')
	async getMessages(@ConnectedSocket() client: Socket, chatId: string) {
		let messages = this.chatService.getMessagesFromChat(chatId);
		client.emit('send_messages_by_chatid', messages);
		// Logger.log(`onChat, message received: ${message}`);
		// client.broadcast.emit('chat', message);
		
	}

}
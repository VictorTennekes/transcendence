import { Logger, Req, UseFilters, UseGuards } from "@nestjs/common";
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import { ConnectedSocket } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { UserService } from "@user/user.service";
import { parse } from 'cookie';
import { LoginGuard } from "src/auth/login.guard";
import * as session from 'express-session';
import {ConfigService} from '@nestjs/config'
import { UserDTO } from "@user/dto/user.dto";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { UnauthorizedFilter } from "src/auth/unauthorized.filter";
import { MessageDTO, randomsgDTO } from "./dto/message.dto";

// var cookieParser = require('cookie-parser')

class socketData {
	user: UserDTO;
	socket: Socket;
}

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;

	constructor(private chatService: ChatService,
				private userService: UserService,
				private configService: ConfigService) {}

	connectedSockets: socketData[] = []

	async afterInit() {
		Logger.log("yo");
	}

	async getUserFromSocket(socket: Socket): Promise<UserDTO> {

		const cookie = socket.handshake.headers.cookie;

		Logger.log(`cookie: ${cookie}`)
		if (!cookie) return null; // no cookies
		const parsedCookie = parse(cookie);
		Logger.log(`parsed cookie: ${JSON.stringify(parsedCookie)}`)
		// const cookieData = parsedCookie[this.configService.get('s')];
		const cookieData = parsedCookie['connect.sid'];
		Logger.log(JSON.stringify(cookieData));
		let sessionData;

		let sid = cookieData.substr(2, cookieData.indexOf(".") - 2);

	const postgresSession = require('connect-pg-simple')(session);

		const fs = require('fs');
		const path = require('path');

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
		Logger.log(JSON.stringify(otherRes));
		Logger.log(JSON.stringify(otherRes[0].sess.passport));
		if (!otherRes[0].sess.passport) return null;
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
		Logger.log('handle connection');
		const user: UserDTO = await this.getUserFromSocket(client);
		Logger.log(JSON.stringify(user));
		if (!user) return;
		let newSocket: socketData = {
			user: user,
			socket: client
		};
		this.connectedSockets.push(newSocket);
		Logger.log(JSON.stringify(newSocket.user));
		Logger.log('here');
		// Logger.log(JSON.stringify(client));
		// Logger.log(JSON.stringify(client));
		console.log(client.id);
		Logger.log('after');
		// Logger.log(JSON.stringify(newSocket.socket));
		// this.server.emit('users', 1);
		// Logger.log(`added new socket ${newSocket.intra_name}`);
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		Logger.log('disconnecting socket');
		// Logger.log(`${this.connectedSockets[0].socket}`);
		console.log(client.id);
		console.log(this.connectedSockets[0].socket.id);
		// Logger.log(`${client}`);
		const index = this.connectedSockets.findIndex(x => x.socket.id === client.id);
		// const index = this.connectedSockets.indexOf(value);
		// console.log(value.user);
		Logger.log(index);

		this.connectedSockets.splice(index, 1);
		// this.server.emit('users', 0);
	}


	@SubscribeMessage('send_message')
	async sendMessage(@ConnectedSocket() client: Socket, @MessageBody() message: randomsgDTO) {
		Logger.log(`onChat, message received: ${message}`);
		Logger.log('chat id!:');

		Logger.log(message.chat);

		const chat = await this.chatService.getChatById(message.chat);

		console.log(message);
		console.log(chat);

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
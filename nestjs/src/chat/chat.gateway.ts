import { Logger, Req, UseGuards } from "@nestjs/common";
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
		// const sessUser = this.userService.findOne(user);

		// finalUser: UserDTO = {
			// intra_name: sessUser.intra
		// }

		// return sessUser;
		return user;
	}

	@UseGuards(LoginGuard)
	async handleConnection(client: any) {


	// async handleConnection(@ConnectedSocket() client: Socket) {
		// const username = await this.getUserFromSocket(client);
		const user: UserDTO = await this.getUserFromSocket(client);
		if (!user) return;
		let newSocket: socketData = {
			user: user,
			socket: client
		};
		this.connectedSockets.push(newSocket);
		Logger.log(JSON.stringify(newSocket.user));
		// Logger.log(JSON.stringify(newSocket.socket));
		// this.server.emit('users', 1);
		// Logger.log(`added new socket ${newSocket.intra_name}`);
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		const value = this.connectedSockets.find(x => x.socket === client);
		Logger.log(`${value}`);
		// this.server.emit('users', 0);
	}


	@SubscribeMessage('send_message')
	async sendMessage(@ConnectedSocket() client: Socket, @MessageBody() message: string) {
		Logger.log(`onChat, message received: ${message}`);
		// client.broadcast.emit('chat', message);
		//get correct users
		// const author = this.getUserFromSocket(client);
		//you can get user from cookie, but i can also get a user easier i think?
		//now how do i get users to send the message to from this?

		this.server.sockets.emit('receive_message', message);

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
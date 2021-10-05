import { Logger, Req, UseFilters, UseGuards } from "@nestjs/common";
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
import { request } from "http";
import { getUserFromSocket } from "@shared/socket-utils";

export class socketData {
	user: UserDTO;
	socket: Socket;
}

@WebSocketGateway({ namespace: '/chat'})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;

	constructor(private chatService: ChatService,
				private userService: UserService) {}

	connectedSockets: socketData[] = []

	async afterInit() {
		Logger.log("yo");
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		Logger.log("new connection");
		const user: UserDTO = await getUserFromSocket(client, this.userService);
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
		const user = await getUserFromSocket(client, this.userService);
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

import { Logger } from "@nestjs/common";
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage } from "@nestjs/websockets";
import { MessageDTO } from "./dto/message.dto";


@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;

	async afterInit() {
		Logger.log("yo");
	}

	async handleConnection() {
		this.server.emit('users', 1);
	}

	async handleDisconnect() {
		this.server.emit('users', 0);
	}

	@SubscribeMessage('chat')
	async onChat(client, message: MessageDTO) {
		Logger.log(`onChat, message received: ${message}`);
		client.broadcast.emit('chat', message);
	}

}
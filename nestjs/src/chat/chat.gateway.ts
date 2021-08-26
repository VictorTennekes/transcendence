import { Logger } from "@nestjs/common";
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage } from "@nestjs/websockets";


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
	async onChat(client, message) {
		Logger.log(`onChat, message received: ${message}`);
		client.broadcast.emit('chat', message);
	}

}
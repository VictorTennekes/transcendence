import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketAddress } from 'net';

@WebSocketGateway()
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server;

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string {
		return 'Hello world!';
	}

	sendReady(id: string) {
		Logger.log(`READY ${id}`);
		this.server.emit(`ready${id}`, {});
	}

	handleConnection(@ConnectedSocket() client: Socket) {
		Logger.log("MATCH GATEWAY - CLIENT[${client.id}] - JOINED");
	}
	handleDisconnect(@ConnectedSocket() client: Socket) {
		Logger.log("MATCH GATEWAY - CLIENT[${client.id}] - LEFT");
	}
}

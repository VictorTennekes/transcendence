import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketAddress } from 'net';

@WebSocketGateway()
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string {
		return 'Hello world!';
	}

	handleConnection(@ConnectedSocket() client: Socket) {
		Logger.log("MATCH GATEWAY - CLIENT[${client.id}] - JOINED");
	}
	handleDisconnect(@ConnectedSocket() client: Socket) {
		Logger.log("MATCH GATEWAY - CLIENT[${client.id}] - LEFT");
	}
}

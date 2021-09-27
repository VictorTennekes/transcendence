import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketAddress } from 'net';

@WebSocketGateway()
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server;

	sendReady(id: string) {
		Logger.log(`SERVER SENT 'ready${id}'`);
		this.server.emit(`ready${id}`, {});
	}

	matchAccepted(id: string, state: boolean) {
		this.server.emit(`accepted${id}`, state);
	}

	handleConnection(@ConnectedSocket() client: Socket) {
		
		Logger.log("MATCH GATEWAY - CLIENT[${client.id}] - JOINED");
	}
	handleDisconnect(@ConnectedSocket() client: Socket) {
		Logger.log("MATCH GATEWAY - CLIENT[${client.id}] - LEFT");
	}
}

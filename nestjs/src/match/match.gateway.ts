import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketAddress } from 'net';
import { getUserFromSocket } from '@shared/socket-utils';
import { UserService } from '@user/user.service';
import { MatchService } from './match.service';

@WebSocketGateway()
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly userService: UserService,
//		private readonly matchService: MatchService //circular dependency :(
	) {}

	@WebSocketServer()
	server;

	sendReady(id: string) {
		Logger.log(`SERVER SENT 'ready${id}'`);
		this.server.emit(`ready${id}`, {});
	}

	@SubscribeMessage('find')
	findMatch(client: Socket, settings: any) {
	}

	matchAccepted(id: string, state: boolean) {
		this.server.emit(`accepted${id}`, state);
	}

	handleConnection(@ConnectedSocket() client: Socket) {
//		const user = getUserFromSocket(client, this.userService);
		Logger.log("MATCH GATEWAY - CLIENT[${client.id}] - JOINED");
	}
	handleDisconnect(@ConnectedSocket() client: Socket) {
		Logger.log("MATCH GATEWAY - CLIENT[${client.id}] - LEFT");
	}
}

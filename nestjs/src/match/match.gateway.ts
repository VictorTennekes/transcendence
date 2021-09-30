import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketAddress } from 'net';
import { getUserFromSocket } from '@shared/socket-utils';
import { UserService } from '@user/user.service';
import { MatchService } from './match.service';
import { User } from 'src/game/game.script';

@WebSocketGateway({ namespace: '/match'})
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly userService: UserService,
		private readonly matchService: MatchService //circular dependency :(
	) {}

	@WebSocketServer()
	server;

	sendReady(id: string) {
		Logger.log(`SERVER SENT 'ready${id}'`);
		this.server.emit(`ready${id}`, {});
	}

	@SubscribeMessage('cancel')
	cancelMatch(client: Socket) {
		this.matchService.cancelMatch(client.id);
	}

	@SubscribeMessage('accept')
	acceptMatch(client: Socket) {
		this.matchService.acceptMatch(client.id);
	}

	@SubscribeMessage('find')
	//listen for 'find' event
	//find/create a match
	//send 'ready' to both players once a match is found
	async findMatch(client: Socket, settings: any) {
		const userItem = await getUserFromSocket(client, this.userService);
		const user: User = {
			login: userItem.display_name,
			id: client.id,
		};
		Logger.log(`USER INTRA NAME = ${user.login}`);
		const match: string = this.matchService.findMatch(user, settings);
		Logger.log(`CLIENT ${client.id} -> MATCH ${match}`);
		client.join(match); //add user to the room identified by the matchID
		if (this.matchService.isReady(match)) {
			//when the opponent connects, both players are notified that the match is ready
			Logger.log(`MATCH ${match} -> ready`);
			this.server.to(match).emit('ready');
			var interval = setInterval(() => {
				const accepted = this.matchService.isAccepted(match);
				this.server.to(match).emit('accepted', {id: match, accepted: accepted});
				if (accepted) {
					this.matchService.createGame(match);
					delete(this.matchService.matches[match]);
					this.matchService.matches[match] = undefined;
				}
				//send 'accepted' state to the clients
				clearInterval(interval);
			},3000);
		}
	}

	notifyMatchState(id: string, state: boolean) {
		this.server.emit(`accepted${id}`, state);
	}

	notifyReady(id: string, state: boolean) {
		this.server.emit('ready', state);
	}

	handleConnection(@ConnectedSocket() client: Socket) {
//		const user = getUserFromSocket(client, this.userService);
		Logger.log(`MATCH GATEWAY - CLIENT[${client.id}] - JOINED`);
	}
	handleDisconnect(@ConnectedSocket() client: Socket) {
		Logger.log(`MATCH GATEWAY - CLIENT[${client.id}] - LEFT`);
	}
}

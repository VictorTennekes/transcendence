import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketAddress } from 'net';
import { getUserFromSocket } from '@shared/socket-utils';
import { UserService } from '@user/user.service';
import { MatchService } from './match.service';
import { User } from 'src/game/game.script';
import { MatchSettings } from './match.class';
import { socketData } from '@chat/chat.gateway';
import { UserDTO } from '@user/dto/user.dto';
import { GameService } from 'src/game/game.service';

@WebSocketGateway({ namespace: '/match'})
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly userService: UserService,
		private readonly matchService: MatchService, //circular dependency :(
		private readonly gameService: GameService,
	) {}

	@WebSocketServer()
	server;

	connectedUsers: socketData[] = []

	sendReady(id: string) {
		Logger.log(`SERVER SENT 'ready${id}'`);
		this.server.emit(`ready${id}`, {});
	}

	@SubscribeMessage('cancel')
	cancelMatch(client: Socket) {
		console.log(client.id);
		this.matchService.cancelMatch(client.id);
	}

	@SubscribeMessage('accept')
	acceptMatch(client: Socket) {
		this.matchService.acceptMatch(client.id);
	}

	@SubscribeMessage('join')
	joinMatch(client: Socket, id: string) {
		client.join(id);
	}

	async findMatch(client: Socket, settings: MatchSettings): Promise<string> {
		console.log("in find match. maybe it'll send the response?")
		const userItem = await getUserFromSocket(client, this.userService);
		const user: User = {
			login: userItem.intra_name,
			display_name: userItem.display_name,
			id: client.id,
		};
		Logger.log(`USER INTRA NAME = ${user.login}`);
		const match: string = this.matchService.findMatch(user, settings);
		return match;
	}

	async initiateMatch(client: Socket, match: string) {
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

	@SubscribeMessage('find')
	//listen for 'find' event
	//find/create a match
	//send 'ready' to both players once a match is found
	async queueForMatch(client: Socket, settings: any) {
		const match = await this.findMatch(client, settings);
		this.initiateMatch(client, match);
	}

	@SubscribeMessage('invite_user')
	async inviteUser(client: Socket, settings: MatchSettings) {
		console.log("inviting a user");
		const usr = await getUserFromSocket(client, this.userService);
		const user: User = {
			login: usr.intra_name,
			display_name: usr.display_name,
			id: client.id
		}
		let match = this.matchService.matchExists(user, settings);
		console.log("found match? ", match);
		if (match === null) {
			let inviteSent: boolean = false;
			for (let user of this.connectedUsers) {
				if (user.user.display_name === settings.opponent_username) {
					let sentSettings: MatchSettings = Object.assign({}, settings);
					sentSettings.opponent_username = usr.display_name;
					user.socket.emit('receive_game_invite', sentSettings);
					inviteSent = true;
				}
			}
			if (inviteSent === false) {
				client.emit('game_invite_failure', 'user not online');
			}
			match = await this.findMatch(client, settings);
			this.initiateMatch(client, match);
		} else {
			this.initiateMatch(client, match);
		}

	}

	@SubscribeMessage('invite_declined')
	inviteDeclined(client: Socket, username: string) {
		console.log("invite declined sending to ", username);
		for (let user of this.connectedUsers) {
			if (user.user.display_name === username) {
				console.log("found user, sending error: ", user.user.display_name);
				user.socket.emit('game_invite_failure', "invite declined");
			}
		}
		//find user by username
		//emit game_invite_failure, "invite declined"
	}

	notifyMatchState(id: string, state: boolean) {
		this.server.emit(`accepted${id}`, state);
	}

	notifyReady(id: string, state: boolean) {
		this.server.emit('ready', state);
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		const user: UserDTO = await getUserFromSocket(client, this.userService);
		if (!user) {
			Logger.log("something's wrong, can't find user")
			return;
		}
		let newSocket: socketData = {
			user: user,
			socket: client
		};
		this.connectedUsers.push(newSocket);
		//no reference to a gameID here, cant join the match room
		Logger.log(`MATCH GATEWAY - CLIENT[${client.id}] - JOINED`);
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		Logger.log(`MATCH GATEWAY - CLIENT[${client.id}] - LEFT`);
		const index = this.connectedUsers.findIndex(x => x.socket.id === client.id);
		this.connectedUsers.splice(index, 1);
	}
}

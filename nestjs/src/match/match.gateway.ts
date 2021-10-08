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
		console.log("cansel match")
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

	@SubscribeMessage('find')
	//listen for 'find' event
	//find/create a match
	//send 'ready' to both players once a match is found
	async findMatch(client: Socket, settings: any) {
		console.log("in find match. maybe it'll send the response?")
		const userItem = await getUserFromSocket(client, this.userService);
		const user: User = {
			login: userItem.intra_name,
			display_name: userItem.display_name,
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

	@SubscribeMessage('invite_user')
	async inviteUser(client: Socket, settings: MatchSettings) {
		//send invite to other user
		console.log("inviting: ", settings);
		//TODO:find connected socket
		//TODO: error if not connnected
		//TODO: send invite if connected
		// if (this.matchService.)
		// const matches:  = this.matchService.matches;
		// if (match of matches) {

		// }
		const usr = await getUserFromSocket(client, this.userService);

		const user: User = {
			login: usr.intra_name,
			display_name: usr.display_name,
			id: client.id
		}
		console.log("invite user:")
		let match = this.matchService.matchExists(user, settings);
		console.log(match);
		if (match === null) {

			let inviteSent: boolean = false;
			for (let user of this.connectedUsers) {
				if (user.user.display_name === settings.opponent_username) {
					//TODO: find which user and emit username
					let target_username = "";
					for (let lol of this.connectedUsers) {
						if (client.id === lol.socket.id) {
							target_username = lol.user.display_name;
						}
					}
					user.socket.emit('receive_game_invite', target_username);
					inviteSent = true;
				}
			}
			if (inviteSent === false) {
				client.emit('game_invite_failure', 'user not online');
			}
			this.findMatch(client, settings);
		} else {
			console.log("match exists already")
			console.log(match);

			client.join(match); //add user to the room identified by the matchID
			if (this.matchService.isReady(match)) {
			//when the opponent connects, both players are notified that the match is ready
				Logger.log(`MATCH ${match} -> ready`);
				this.server.to(match).emit('ready');
				var interval = setInterval(() => {
					const accepted = this.matchService.isAccepted(match);
					this.server.to(match).emit('accepted', accepted);
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
	}

	notifyMatchState(id: string, state: boolean) {
		this.server.emit(`accepted${id}`, state);
	}

	notifyReady(id: string, state: boolean) {
		this.server.emit('ready', state);
	}

	@SubscribeMessage('connected_friends')
	async getConnectedFriends(@ConnectedSocket() client: Socket) {
		let user = await getUserFromSocket(client, this.userService);
		user.friends = await this.userService.getFriends(user.intra_name);

		for (let friend of user.friends) {
			for (let connectedUser of this.connectedUsers) {
				if (friend.intra_name === connectedUser.user.intra_name) {
					client.emit('friend_connected', friend);
				}
			}
		}
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		let user: UserDTO = await getUserFromSocket(client, this.userService);
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
		user.friends = await this.userService.getFriends(user.intra_name);
		for (let friend of user.friends) {
			for (let connectedUser of this.connectedUsers) {
				if (friend.intra_name === connectedUser.user.intra_name) {
					connectedUser.socket.emit('friend_connected', user);					
				}
			}
		}
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		Logger.log(`MATCH GATEWAY - CLIENT[${client.id}] - LEFT`);
		const index = this.connectedUsers.findIndex(x => x.socket.id === client.id);
		this.connectedUsers.splice(index, 1);
		let user = await getUserFromSocket(client, this.userService);
		user.friends = await this.userService.getFriends(user.intra_name);  		
		for (let friend of user.friends) {
			for (let connectedUser of this.connectedUsers) {
				if (friend.intra_name === connectedUser.user.intra_name) {
					connectedUser.socket.emit('friend_disconnected', user);					
				}
			}
		}
	}
}

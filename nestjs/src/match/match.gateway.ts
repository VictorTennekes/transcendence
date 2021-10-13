import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketAddress } from 'net';
import { getUserFromSocket } from '@shared/socket-utils';
import { UserService } from '@user/user.service';
import { MatchService } from './match.service';
import { User } from 'src/game/game.script';
// import { MatchSettings } from './match.class';
import { socketData } from '@chat/chat.gateway';
import { UserDTO } from '@user/dto/user.dto';
import { GameService } from 'src/game/game.service';
import { Match, MatchSettings } from './match.class';

@WebSocketGateway({ namespace: '/match'})
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly userService: UserService,
		private readonly matchService: MatchService, //circular dependency :(
		private readonly gameService: GameService,
	) {}

	@WebSocketServer()
	server;

	@SubscribeMessage('cancel')
	cancelMatch(client: Socket) {
		this.matchService.cancelMatch(client);
	}

	@SubscribeMessage('listen')
	listenMatch(client: Socket) {
		//set this client to ready
		this.matchService.listenMatch(client.id);
	}

		//check if both are ready

	connectedUsers: socketData[] = []

	sendReady(id: string) {
		Logger.log(`SERVER SENT 'ready${id}'`);
		this.server.emit(`ready${id}`, {});
	}

	@SubscribeMessage('accept')
	acceptMatch(client: Socket) {
		this.matchService.acceptMatch(client.id);
	}

	@SubscribeMessage('decline')
	declineMatch(client: Socket) {
		this.matchService.decline(client);
	}

	@SubscribeMessage('join')
	joinMatch(client: Socket, id: string) {
		client.join(id);
	}

	@SubscribeMessage('find')
	//listen for 'find' event
	//find/create a match
	//send 'ready' to both players once a match is found
	async findMatch(client: Socket, settings: MatchSettings) {
		// Logger.log(JSON.stringify(settings));
		const userItem = await getUserFromSocket(client, this.userService);
		const user: User = {
			login: userItem.intra_name,
			display_name: userItem.display_name,
			socket: client
		};
		// Logger.log(JSON.stringify(user));
		const matchid: string = this.matchService.findMatch(user, settings);
		client.join(matchid); //add user to the room identified by the matchID
		const id = matchid;
		// Logger.log(`MATCH[${id}] - FINDMATCH`);
		if (this.matchService.matches[id].ready) {
			Logger.log(`MATCH ${id} - BOTH ARE LISTENING`);
			this.server.to(id).emit('ready');
			var interval = setInterval(() => {
				const accepted = this.matchService.isAccepted(id);
				this.server.to(id).emit('accepted', {id: id, accepted: accepted});
				const match = this.matchService.matches[id];
				if (match !== undefined) {
					if (accepted) {
						Logger.log(`MATCH ${id} - BOTH ACCEPTED`);
						this.matchService.createGame(id);
						this.matchService.deleteMatch(id);
					}
					else {
						this.leaveMatchRooms(match);
						if (this.matchService.matches[id].bothDidntAccept()) {
							this.matchService.deleteMatch(id);
						}
						else {
							this.matchService.matches[id].resetMatchData();
						}
					}
				}
				//send 'accepted' state to the clients
				clearInterval(interval);
			},3000);
		}
		else {
			Logger.log(`MATCH[${id}] - LISTENING - ${this.matchService.matches[id].ready}`);
		}
		Logger.log(`GAME[${matchid}] - FOUND - USER[${client.id}]`);
	}

	leaveMatchRooms(match: Match) {
		if (match === undefined)
			return ;
		if (!match.userAccepted(match.creator))
			match.creator.socket.leave(match.id);
		if (!match.userAccepted(match.opponent))
			match.opponent.socket.leave(match.id);
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
			socket: client
		}
		console.log("invite user:")
		// console.log(settings);
		let match = this.matchService.matchExists(user, settings);
		console.log(match);
		if (match === null) {
			console.log("sending invite");

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
			console.log("going to find match");
			this.findMatch(client, settings);
		} else {
			console.log("match exists already")
			console.log(settings);
			console.log(match);

				client.join(match); //add user to the room identified by the matchID
				const id = match;
				// Logger.log(`MATCH[${id}] - FINDMATCH`);
				if (this.matchService.matches[id].ready) {
					Logger.log(`MATCH ${id} - BOTH ARE LISTENING`);
					this.server.to(id).emit('ready');
					var interval = setInterval(() => {
						const accepted = this.matchService.isAccepted(id);
						this.server.to(id).emit('accepted', {id: id, accepted: accepted});
						const match = this.matchService.matches[id];
						if (match !== undefined) {
							if (accepted) {
								Logger.log(`MATCH ${id} - BOTH ACCEPTED`);
								this.matchService.createGame(id);
								this.matchService.deleteMatch(id);
							}
							else {
								this.leaveMatchRooms(match);
								if (this.matchService.matches[id].bothDidntAccept()) {
									this.matchService.deleteMatch(id);
								}
								else {
									this.matchService.matches[id].resetMatchData();
								}
							}
						}
						//send 'accepted' state to the clients
						clearInterval(interval);
					},3000);
				}
				else {
					Logger.log(`MATCH[${id}] - LISTENING - ${this.matchService.matches[id].ready}`);
				}
				Logger.log(`GAME[${match}] - FOUND - USER[${client.id}]`);







			// client.join(match); //add user to the room identified by the matchID
			// if (this.matchService.isReady(match)) {
			// //when the opponent connects, both players are notified that the match is ready
			// 	Logger.log(`MATCH ${match} -> ready`);
			// 	this.server.to(match).emit('ready');
			// 	var interval = setInterval(() => {
			// 		const accepted = this.matchService.isAccepted(match);
			// 		this.server.to(match).emit('accepted', accepted);
			// 		if (accepted) {
			// 			this.matchService.createGame(match);
			// 			delete(this.matchService.matches[match]);
			// 			this.matchService.matches[match] = undefined;
			// 		}
			// 		//send 'accepted' state to the clients
			// 		clearInterval(interval);
			// 	},3000);

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
		Logger.log(`MATCH GATEWAY - USER[${client.id}] - JOINED`);
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		this.matchService.cancelMatch(client);

		Logger.log(`MATCH GATEWAY - USER[${client.id}] - LEFT`);
		Logger.log(`MATCH GATEWAY - CLIENT[${client.id}] - LEFT`);
		const index = this.connectedUsers.findIndex(x => x.socket.id === client.id);
		this.connectedUsers.splice(index, 1);
	}
}

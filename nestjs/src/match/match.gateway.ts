import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserService } from '@user/user.service';
import { MatchService } from './match.service';
import { User } from 'src/game/game.script';
import { socketData } from '@chat/chat.gateway';
import { UserDTO } from '@user/dto/user.dto';
import { Match, MatchSettings } from './match.class';
import { GameService } from 'src/game/game.service';
import { connect } from 'http2';

class FriendRequest {
	receive: string;
	submit: UserDTO;
}

@WebSocketGateway({ namespace: '/match'})
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly userService: UserService,
		private readonly matchService: MatchService,
		private readonly gameService: GameService,
	) {}

	@WebSocketServer()
	server;

	@SubscribeMessage('cancel')
	cancelMatch(client: Socket) {
		this.matchService.cancelMatch(client);
	}

	connectedUsers: socketData[] = []
	pendingFriendRequests: FriendRequest[] = [];

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

	async findMatch(client: Socket, settings: MatchSettings): Promise<string> {
		const userItem = await this.userService.getUserFromSocket(client);
		const user: User = {
			login: userItem.intra_name,
			display_name: userItem.display_name,
			socket: client
		};
		Logger.log(`USER INTRA NAME = ${user.login}`);
		const match: string = this.matchService.findMatch(user, settings);
		return match;
	}

	async emitInGame(id: string, opponent: string, creator: string) {
		let friends: UserDTO[] = await this.userService.getFriends(opponent);
		let user: UserDTO = await this.userService.findOne(opponent);
		for (const socket of this.connectedUsers) {
			if (socket.user.intra_name === creator || opponent) {
				socket.socket.emit('ingame', id);
			}
		}
		for (let friend of friends) {
			let usr = this.isOnline(friend.intra_name);
			if (usr) {
				usr.socket.emit('friend_in_game', user);
			}
		}
		friends = await this.userService.getFriends(creator);
		user = await this.userService.findOne(creator);
		for (let friend of friends) {
			let usr = this.isOnline(friend.intra_name);
			if (usr) {
				usr.socket.emit('friend_in_game', user);
			}
		}
	}

	initiateMatch(client: Socket, match: string) {
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
						this.emitInGame(id, match.opponent.login, match.creator.login);
						this.matchService.deleteMatch(id);
					}
					else {
						if (match.settings.opponent_username !== undefined) {
							match.creator.socket.leave(match.id);
							match.opponent.socket.leave(match.id);
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
				}
				//send 'accepted' state to the clients
				clearInterval(interval);
			},3000);
		}
		else {
			Logger.log(`MATCH[${id}] - LISTENING - ${this.matchService.matches[id].ready}`);
		}
		Logger.log(`GAME[${id}] - FOUND - USER[${client.id}]`);

	}

	leaveMatchRooms(match: Match) {
		if (match === undefined)
			return ;
		if (!match.userAccepted(match.creator))
			match.creator.socket.leave(match.id);
		if (!match.userAccepted(match.opponent))
			match.opponent.socket.leave(match.id);
	}

	@SubscribeMessage('find')
	async queueForMatch(client: Socket, settings: any) {
		const match = await this.findMatch(client, settings);
		this.initiateMatch(client, match);
	}

	//called by both the inviter and the invited player
	@SubscribeMessage('invite_user')
	async inviteUser(client: Socket, settings: MatchSettings) {
		const usr = await this.userService.getUserFromSocket(client);
		for (let blocker of usr.blockedByUsers) {
			if (blocker.intra_name === settings.opponent_username) {
				client.emit('game_invite_failure', {error: "you're blocked creep"});
				return;
			}
		}
		const user: User = {
			login: usr.intra_name,
			display_name: usr.display_name,
			socket: client
		}
		if (this.gameService.isIngame(user.login))
			return ;
		Logger.log(`INVITE USER CALLED`);
		let inviteSent: boolean = false;
		// console.log("connected users: ", this.connectedUsers);
		for (let connectedUser of this.connectedUsers) {
			if (connectedUser.user.intra_name === settings.opponent_username) {
				let sentSettings: MatchSettings = Object.assign({}, settings);
				sentSettings.opponent_username = usr.intra_name;
				//this.findMatch is doing a bunch of redundant checks, could just create the match right away tbh
				const match = this.matchService.createMatch(user, settings);
				// const match = await this.findMatch(client, settings);
				this.initiateMatch(client, match);
				connectedUser.socket.emit('receive_game_invite', {host: user.login, id: match});
				inviteSent = true;
				break ;
			}
		}
		if (inviteSent === false) {
			client.emit('game_invite_failure', {error: 'user not online'});
		}
	}

	@SubscribeMessage('invite_accepted')
	async acceptInvite(client: Socket, id: string) {
		const usr = await this.userService.getUserFromSocket(client);
		const user: User = {
			login: usr.intra_name,
			display_name: usr.display_name,
			socket: client
		};
		const match = this.matchService.matches[id];
		if (match === undefined || match.settings?.opponent_username !== user.login) {
			//not invited
			return ;
		}
		Logger.log(`USER ${user.login} - ACCEPTED INVITE TO ${id}`);
		this.matchService.matches[id].setOpponent(user);
		this.initiateMatch(client, id);
	}

	@SubscribeMessage('invite_declined')
	inviteDeclined(client: Socket, username: string) {
		for (let user of this.connectedUsers) {
			if (user.user.intra_name === username) {
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

	public userExists(username: string, users: string[]) {
		return users.some(function(intra_name) {
			return intra_name === username;
		});
	}

	@SubscribeMessage('connected_friends')
	async getConnectedFriends(@ConnectedSocket() client: Socket) {
		let user = await this.userService.getUserFromSocket(client);
		user.friends = await this.userService.getFriends(user.intra_name);
		let players: string[] = [];
		for (let key in this.gameService.games) {
			if (this.gameService.games[key] && this.gameService.games[key].data) {
				let lol = this.gameService.games[key].data.users;
				players.push(lol.one.login);
				players.push(lol.two.login);
			}
		}	
		for (let friend of user.friends) {
			for (let connectedUser of this.connectedUsers) {
				if (friend.intra_name === connectedUser.user.intra_name) {
					if (this.userExists(friend.intra_name, players)) {
						client.emit('friend_in_game', friend);
					} else {
						client.emit('friend_connected', friend);
					}
				}
			}
		}
	}

	async handleConnection(@ConnectedSocket() client: Socket) {
		let user: UserDTO = await this.userService.getUserFromSocket(client);
		if (!user) {
			return;
		}
		else {
			Logger.log(`MATCH GATEWAY - NEW CONNECTION - USER ${user.intra_name}`);
		}
		let newSocket: socketData = {
			user: user,
			socket: client
		};
		this.connectedUsers.push(newSocket);
		Logger.log(`MATCH GATEWAY - USER[${client.id}] - JOINED`);
		
		for (let requestIndex = 0; requestIndex < this.pendingFriendRequests.length; requestIndex++) {
			if (this.pendingFriendRequests[requestIndex].receive === user.intra_name) {
				client.emit('receive-friend-request', this.pendingFriendRequests[requestIndex].submit);
			}
		}
		let friends: UserDTO[] = await this.userService.getFriends(user.intra_name);
		for (let friend of friends) {
			let usr = this.isOnline(friend.intra_name);
			if (usr) {
				usr.socket.emit('friend_connected', user);
			}
		}
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		this.matchService.cancelMatch(client);

		Logger.log(`MATCH GATEWAY - USER[${client.id}] - LEFT`);
		Logger.log(`MATCH GATEWAY - CLIENT[${client.id}] - LEFT`);
		const index = this.connectedUsers.findIndex(x => x.socket.id === client.id);
		let user: UserDTO = this.connectedUsers[index].user;
		this.connectedUsers.splice(index, 1);
		for (let friend of this.connectedUsers) {
			friend.socket.emit('friend_disconnected', user);
		}
	}

	@SubscribeMessage('send-friend-request')
	async handleFriendRequest(client: Socket, username: string) {
		let user: UserDTO = await this.userService.getUserFromSocket(client);
		let sender: socketData = {
			user: user,
			socket: client
		};
		let friends: UserDTO[] = await this.userService.getFriends(user.intra_name);
		for (let friend of friends) {
			if (friend.intra_name === username) {
				return;
			}
		}
		for (let req of this.pendingFriendRequests) {
			if (req.receive === username && req.submit.intra_name === user.intra_name) {
				return;
			}
		}
		for (let blocker of user.blockedByUsers) {
			if (blocker.intra_name === username) {
				client.emit("friend_request_failure", {error: "you're blocked creep"});
				return;
			}
		}
		const newRequest: FriendRequest = {
			submit: user,
			receive: username
		}
		this.pendingFriendRequests.push(newRequest);
		let connectedUser: socketData = this.isOnline(username);
		if (connectedUser) {
			this.sendFriendRequest(sender, connectedUser);
		} else {
			const newRequest: FriendRequest = {
				submit: user,
				receive: username
			}
			this.pendingFriendRequests.push(newRequest);
		}
	}

	@SubscribeMessage('remove-friend')
	async removeFriend(client: Socket, username: string) {
		const user = await this.userService.getUserFromSocket(client);
		//confirm that the user and the target are friends
		if (!this.userService.isFriendedByUser(user.intra_name, username)) {
			return ;
		}
		//find the socket of the target
		const target = this.isOnline(username);
		if (target !== null) {
			//send 'friend-removed' event notifying the target that they are no longer friends
			target.socket.emit('friend-removed', user);
			client.emit('friend-removed', target.user);
		}
	}

	isOnline(username: string): socketData | null {
		for (let user of this.connectedUsers) {
			if (user.user.intra_name === username) {
				return user;
			}
		}
		return null;
	}

	sendFriendRequest(client: socketData, target: socketData) {
		target.socket.emit('receive-friend-request', client.user);
	}

	removePendingFriendRequest(submit: string, receive: string) {
		for (let index = 0; index <  this.pendingFriendRequests.length; index++) {
			if (this.pendingFriendRequests[index].submit.intra_name === submit
				&& this.pendingFriendRequests[index].receive === receive) {
					this.pendingFriendRequests.splice(index, 1);
			}
		}
	}

	@SubscribeMessage('accept-friend-request')
	async acceptFriendRequest(client: Socket, friend: UserDTO) {
		const user: UserDTO = await this.userService.getUserFromSocket(client);
		await this.userService.addFriend(user.intra_name, friend.intra_name);
		this.removePendingFriendRequest(friend.intra_name, user.intra_name);
		const target = this.isOnline(friend.intra_name);
		if (target !== null) {
			client.emit('friend-accepted', friend);
			target.socket.emit('friend-accepted', user);
		}
	}

	@SubscribeMessage('decline-friend-request')
	async declineFriendRequest(client: Socket, friend: UserDTO) {
		const user: UserDTO = await this.userService.getUserFromSocket(client);
		this.removePendingFriendRequest(friend.intra_name, user.intra_name);
	}
}

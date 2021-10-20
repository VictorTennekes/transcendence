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

class FriendRequest {
	receive: string;
	submit: UserDTO;
}

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
			socket: client
		};
		Logger.log(`USER INTRA NAME = ${user.login}`);
		const match: string = this.matchService.findMatch(user, settings);
		return match;
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
	//listen for 'find' event
	//find/create a match
	//send 'ready' to both players once a match is found
	async queueForMatch(client: Socket, settings: any) {
		const match = await this.findMatch(client, settings);
		this.initiateMatch(client, match);
	}

	@SubscribeMessage('invite_user')
	async inviteUser(client: Socket, settings: MatchSettings) {
		const usr = await getUserFromSocket(client, this.userService);
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
		let match = this.matchService.matchExists(user, settings);
		if (match === null) {
			let inviteSent: boolean = false;
			console.log("connected users: ", this.connectedUsers);
			for (let connectedUser of this.connectedUsers) {
				if (connectedUser.user.intra_name === settings.opponent_username) {
					let sentSettings: MatchSettings = Object.assign({}, settings);
					sentSettings.opponent_username = usr.intra_name;
					connectedUser.socket.emit('receive_game_invite', sentSettings);
					inviteSent = true;
				}
			}
			if (inviteSent === false) {
				client.emit('game_invite_failure', {error: "user not online"});
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
			if (user.user.intra_name === username) {
				console.log("found user, sending error: ", user.user.intra_name);
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
		let user: UserDTO = await getUserFromSocket(client, this.userService);
		let sender: socketData = {
			user: user,
			socket: client
		};
		for (let req of this.pendingFriendRequests) {
			if (req.receive === username && req.submit.intra_name === user.intra_name) {
				return;
			}
		}
		for (let blocker of user.blockedByUsers) {
			if (blocker.intra_name === username) {
				console.log("here??");
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
		}
	}

	@SubscribeMessage('remove-friend')
	async removeFriend(client: Socket, username: string) {
		const user = await getUserFromSocket(client, this.userService);
		//confirm that the user and the target are friends
		if (!this.userService.isFriendedByUser(user.intra_name, username)) {
			return ;
		}
		//find the socket of the target
		const target = this.isOnline(username);
		if (target !== null) {
			//send 'friend-removed' event notifying the target that they are no longer friends
			target.socket.emit('friend-removed');
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
		console.log("after");
		console.log(this.pendingFriendRequests);
	}

	@SubscribeMessage('accept-friend-request')
	async acceptFriendRequest(client: Socket, friend: UserDTO) {
		const user: UserDTO = await getUserFromSocket(client, this.userService);
		await this.userService.addFriend(user.intra_name, friend.intra_name);
		this.removePendingFriendRequest(friend.intra_name, user.intra_name);
		const target = this.isOnline(friend.intra_name);
		if (target !== null) {
			client.emit('friend-accepted');
			target.socket.emit('friend-accepted');
		}
	}

	@SubscribeMessage('decline-friend-request')
	async declineFriendRequest(client: Socket, friend: UserDTO) {
		const user: UserDTO = await getUserFromSocket(client, this.userService);
		this.removePendingFriendRequest(friend.intra_name, user.intra_name);
	}
}

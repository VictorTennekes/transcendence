import { forwardRef, Inject, Logger } from "@nestjs/common";
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import { ConnectedSocket } from "@nestjs/websockets";
import { UserService } from "@user/user.service";
import { Socket } from "socket.io";
import { Game, User } from "./game.script";
import { GameService } from "./game.service";

@WebSocketGateway({ namespace: '/match'})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;

	constructor(
		@Inject(forwardRef(() => GameService))
		private readonly gameService: GameService,
		private readonly userService: UserService,
	) {
	}

	afterInit() {
	}

	//notify the watchers (players + spectators) of the game that the game is finished
	sendFinished(room: string) {
		this.server.to(room).emit('finished');
		this.server.emit('game-finished');
	}

	handleDisconnect(@ConnectedSocket() client) {
	}

	sendGameUpdate(room: string, data: any) {
		this.server.to(room).emit('gamedata', data);
	}

	@SubscribeMessage('join')
	joinMatch(client: Socket, id: string) {
		client.join(id);
	}

	//TODO: validate client IDs first

	//the gateway needs the service to interact with the running Game

	// `MATCH[${id}] - LISTEN - USER[${user}]`

	@SubscribeMessage('press_up')
	press_up(@ConnectedSocket() client) {
		
		this.gameService.setKeyPressed(client.id, 'ArrowUp', true);
	}
	
	@SubscribeMessage('release_up')
	release_up(@ConnectedSocket() client) {
		this.gameService.setKeyPressed(client.id, 'ArrowUp', false);
	}
	@SubscribeMessage('press_down')
	press_down(@ConnectedSocket() client) {
		this.gameService.setKeyPressed(client.id, 'ArrowDown', true);
	}
	
	@SubscribeMessage('release_down')
	release_down(@ConnectedSocket() client) {
		this.gameService.setKeyPressed(client.id, 'ArrowDown', false);
	}
	
	@SubscribeMessage('refresh_connection')
	async refreshConnection(@ConnectedSocket() client) {
		const usr = await this.userService.getUserFromSocket(client);
		const user: User = {
			display_name: usr.display_name,
			login: usr.intra_name,
			socket: client
		};
		for (const id in this.gameService.games) {
			if (this.gameService.games[id] === undefined)
				continue ;
			if (this.gameService.games[id].users.one.login === user.login) {
				this.gameService.games[id].replaceActiveSocket('one', user);
				break ;
			}
			else if (this.gameService.games[id].users.two.login === user.login) {
				this.gameService.games[id].replaceActiveSocket('two', user);
				break ;
			}
		}
	}

	async handleConnection(@ConnectedSocket() client: Socket) {

		this.refreshConnection(client);
		// this.interval[client.id] = setInterval(() => this.gameLoop(), 1000/60);
	}
}

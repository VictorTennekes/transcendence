import { forwardRef, Inject, Logger } from "@nestjs/common";
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import { ConnectedSocket } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { Game } from "./game.script";
import { GameService } from "./game.service";

@WebSocketGateway({ namespace: '/match'})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;

	constructor(
		@Inject(forwardRef(() => GameService))
		private readonly gameService: GameService
	) {
	}

	afterInit() {
		console.log("Initialized game gateway");
	}

	//notify the watchers (players + spectators) of the game that the game is finished
	sendFinished(room: string) {
		this.server.to(room).emit('finished');
	}

	handleDisconnect(@ConnectedSocket() client) {
		console.log(`GAME GATEWAY - USER[${client.id} - LEFT]`);
	}

	sendGameUpdate(room: string, data: any) {
		this.server.to(room).emit('gamedata', data);
	}

	//TODO: validate client IDs first

	//the gateway needs the service to interact with the running Game

	// `MATCH[${id}] - LISTEN - USER[${user}]`

	@SubscribeMessage('press_up')
	press_up(@ConnectedSocket() client) {
		Logger.log(`USER[${client.id}] - PRESS UP`);
		this.gameService.setKeyPressed(client.id, 'ArrowUp', true);
	}
	
	@SubscribeMessage('release_up')
	release_up(@ConnectedSocket() client) {
		Logger.log(`USER[${client.id}] - RELEASE UP`);
		this.gameService.setKeyPressed(client.id, 'ArrowUp', false);
	}
	@SubscribeMessage('press_down')
	press_down(@ConnectedSocket() client) {
		Logger.log(`USER[${client.id}] - PRESS DOWN`);
		this.gameService.setKeyPressed(client.id, 'ArrowDown', true);
	}
	
	@SubscribeMessage('release_down')
	release_down(@ConnectedSocket() client) {
		Logger.log(`USER[${client.id}] - RELEASE DOWN`);
		this.gameService.setKeyPressed(client.id, 'ArrowDown', false);
	}
	
	handleConnection(@ConnectedSocket() client: Socket) {
		Logger.log(`GAME GATEWAY - CONNECT - USER[${client.id}]`);
		// this.interval[client.id] = setInterval(() => this.gameLoop(), 1000/60);
	}
}

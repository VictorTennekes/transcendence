import { Logger } from "@nestjs/common";
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import { ConnectedSocket } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { Game } from "./game.script";
import { GameService } from "./game.service";

@WebSocketGateway({ namespace: '/match'})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;
	interval: {[key: string] : NodeJS.Timer} = {};

	constructor(
		private readonly gameService: GameService
	) {
	}

	afterInit() {
		console.log("Initialized game gateway");
	}

	handleDisconnect(@ConnectedSocket() client) {
		console.log(`CLIENT[${client.id} - LEFT]`);
		clearInterval(this.interval[client.id]);
	}

	sendGameUpdate(room: string, data: any) {
		this.server.to(room).emit('gamedata', data);
	}

	//TODO: validate client IDs first

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

	handleConnection(@ConnectedSocket() client: Socket) {
		Logger.log(`GAME GATEWAY - CLIENT[${client.id}] - JOINED]`);
		// this.interval[client.id] = setInterval(() => this.gameLoop(), 1000/60);
	}
}

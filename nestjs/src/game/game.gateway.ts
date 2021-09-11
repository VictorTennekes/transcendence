import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import { ConnectedSocket } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { GameService } from "./game.service";
import { Game } from "./game.script";

@WebSocketGateway()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;
	game: Game;
	interval: {[key: string] : NodeJS.Timer} = {};

	constructor(
		private readonly gameService: GameService
	) {
		this.game = new Game();
		this.game.update();
	}

	afterInit() {
		console.log("Initialized game gateway");
	}

	handleDisconnect(@ConnectedSocket() client) {
		console.log(`CLIENT[${client.id} - LEFT]`);
		clearInterval(this.interval[client.id]);
	}

	gameLoop() {
		this.game.update();
		const data = this.game.data;
		this.server.emit('gamedata', data);
	}

	@SubscribeMessage('press_up')
	press_up(@ConnectedSocket() client) {
//		console.log("PRESS UP");
		this.game.setKeyPressed('one', 'ArrowUp', true);
	}
	
	@SubscribeMessage('release_up')
	release_up(@ConnectedSocket() client) {
//		console.log("RELEASE UP");
		this.game.setKeyPressed('one', 'ArrowUp', false);
	}
	@SubscribeMessage('press_down')
	press_down(@ConnectedSocket() client) {
//		console.log("PRESS DOWN");
		this.game.setKeyPressed('one', 'ArrowDown', true);
	}
	
	@SubscribeMessage('release_down')
	release_down(@ConnectedSocket() client) {
//		console.log("RELEASE DOWN");
		this.game.setKeyPressed('one', 'ArrowDown', false);
	}

	handleConnection(@ConnectedSocket() client: Socket) {
		console.log(`CLIENT[${client.id} - JOINED]`);
		this.interval[client.id] = setInterval(() => this.gameLoop(), 1000/60);
//		client.emit('gamedata', {});
	}
}

import { Injectable } from '@nestjs/common';
import { Match } from 'src/match/match.class';
import { GameGateway } from './game.gateway';
import { Game } from './game.script';

@Injectable()
export class GameService {

	games: {[key: string] : Game} = {};
	gameIntervals: {[key: string] : NodeJS.Timer} = {};

	constructor(
		private readonly gameGateway: GameGateway
	) {}

	setKeyPressed(id: string, arrow: string, state: boolean) {
		
	}

	gameLoop(id: string) {
		this.games[id].update();
		const data = this.games[id].data;
		this.gameGateway.sendGameUpdate(id, data);
	}
	//create a game when both players have accepted the match
	createGame(match: Match) {
		this.games[match.id] = new Game(match);
		this.gameIntervals[match.id] = setInterval(() => {this.gameLoop(match.id);}, 1000/60);
		//create a Game for this id, and start a game update interval
	}
}

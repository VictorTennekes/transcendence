import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Match } from 'src/match/match.class';
import { GameGateway } from './game.gateway';
import { Game } from './game.script';

@Injectable()
export class GameService {

	games: {[key: string] : Game} = {};
	gameIntervals: {[key: string] : NodeJS.Timer} = {};

	constructor(
		@Inject(forwardRef(() => GameGateway))
		private readonly gameGateway: GameGateway
	) {}

	getGameID(clientID: string) {
		for (const key in this.games) {
			const players = this.games[key].users;
			// Logger.log(`players: ${JSON.stringify(players)}`);
			for (const index in players) {
				// Logger.log(`${players[index]} - ${clientID}`);
				if (clientID === players[index])
					return key;
			}
		}
		return null;
	}

	setKeyPressed(id: string, arrow: string, state: boolean) {
		const gameID = this.getGameID(id);
		Logger.log(`PLAYER ID: ${id} -> GAME ${gameID}`);
		this.games[gameID].setKeyPressed(id, arrow, state);
	}

	//the service needs to interact with the gateway to send updates to the users
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

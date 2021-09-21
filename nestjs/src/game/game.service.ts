import { Injectable } from '@nestjs/common';
import { Game } from './game.script';

@Injectable()
export class GameService {

	games: {[key: string] : Game};

	constructor(
		
	) {}

	//create a game when both players have accepted the match
	createGame(id: string) {

		//create a Game for this id, and start a game update interval
	}
}

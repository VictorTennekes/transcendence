import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUserFromSocket } from '@shared/socket-utils';
import { UserEntity } from '@user/entities/user.entity';
import { UserService } from '@user/user.service';
import { match } from 'assert';
import { getDefaultSettings } from 'http2';
import { Match } from 'src/match/match.class';
import { Repository } from 'typeorm';
import { GameEntity } from './entity/game.entity';
import { GameGateway } from './game.gateway';
import { Game, User } from './game.script';

@Injectable()
export class GameService {

	games: {[key: string] : Game} = {};
	gameIntervals: {[key: string] : NodeJS.Timer} = {};

	constructor(
		@InjectRepository(GameEntity)
		private readonly gameRepository: Repository<GameEntity>,
		@Inject(forwardRef(() => GameGateway))
		private readonly gameGateway: GameGateway,
		private readonly userService: UserService,
	) {}

	get(id: string) {
		return this.gameRepository.findOne({where: {id: id}});
	}

	async gameFinished(id: string): Promise<boolean> {
		const game = await this.gameRepository.findOne({where: {id: id}});
		Logger.log(`GAME OBJECT = ${game}`);
		if (game === undefined)
			return false;
		return true;
	}

	getGameID(clientID: string) {
		for (const key in this.games) {
			const players = this.games[key].users;
			// Logger.log(`players: ${JSON.stringify(players)}`);
			if (players.one.id == clientID || players.two.id == clientID)
				return key;
		}
		return null;
	}

	setKeyPressed(id: string, arrow: string, state: boolean) {
		const gameID = this.getGameID(id);
		if (!gameID)
			return ;
		Logger.log(`PLAYER ID: ${id} -> GAME ${gameID}`);
		this.games[gameID].setKeyPressed(id, arrow, state);
	}

	private async saveGameInDatabase(id: string) {
		const game = this.games[id];
		if (!game || !game.goalReached)
			return ;
		let players: UserEntity[] = [];
		players.push(await this.userService.findOne(game.users.one.login));
		players.push(await this.userService.findOne(game.users.two.login));
		const entry: GameEntity = this.gameRepository.create({
			id: id,
			duration: game.timeElapsed,
			start: game.startTime,
			end: new Date(),
			players: players,
			data: {
				scores: game.scores,
				winner: game.winner
			}
		});
		await this.gameRepository.save(entry);
	}
	//the service needs to interact with the gateway to send updates to the users
	private gameLoop(id: string) {
		if (this.games[id].goalReached) {
			this.gameGateway.sendFinished(id);
			this.saveGameInDatabase(id);
			clearInterval(this.gameIntervals[id]);
			return ;
		}
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

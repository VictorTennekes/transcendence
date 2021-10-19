import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@user/entities/user.entity';
import { UserService } from '@user/user.service';
import { match } from 'assert';
import { lookupService } from 'dns';
import { getDefaultSettings } from 'http2';
import { Match } from 'src/match/match.class';
import { Repository } from 'typeorm';
import { GameEntity } from './entity/game.entity';
import { GameGateway } from './game.gateway';
import { Game, User } from './game.script';

export interface HistoryObject {
	winner: UserEntity,
	opponent: UserEntity,
	score: {[key: string] : number},
	date: Date,
	duration: number
};

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
		Logger.log(`GAME[${id}] - FINISHED`);
		if (game === undefined)
			return false;
		return true;
	}

	getGameID(clientID: string) {
		for (const key in this.games) {
			if (this.games[key] === undefined)
				continue ;
			const players = this.games[key].users;
			// Logger.log(`players: ${JSON.stringify(players)}`);
			if (players.one.socket.id == clientID || players.two.socket.id == clientID)
				return key;
		}
		return null;
	}

	setKeyPressed(id: string, arrow: string, state: boolean) {
		const gameID = this.getGameID(id);
		if (!gameID) {
			Logger.log(`CLIENT[${id}] - NOT PART OF ANY GAME`);
			return ;
		}
		// Logger.log(`PLAYER ID: ${id} -> GAME ${gameID}`);
		this.games[gameID].setKeyPressed(id, arrow, state);
	}

	private async saveGameInDatabase(id: string) {
		const game = this.games[id];
		if (!game || !game.goalReached)
			return ;
		const gameDuration = game.timeElapsed;
		const gameDurationInSeconds = Math.floor(gameDuration / 1000);
		let players: UserEntity[] = [];
		players.push(await this.userService.findOne(game.users.one.login));
		players.push(await this.userService.findOne(game.users.two.login));
		const gameData = game.data;
		players[0].gameData.ballHits += gameData.players[game.users.one.socket.id].hits;
		players[1].gameData.ballHits += gameData.players[game.users.two.socket.id].hits;
		if (game.winner == game.users.one.login) {
			players[0].gameData.games.won += 1;
			players[1].gameData.games.lost += 1;
		}
		else {
			players[1].gameData.games.won += 1;
			players[0].gameData.games.lost += 1;
		}
		players[0].gameData.points.won += gameData.players[game.users.one.socket.id].score;
		players[0].gameData.points.lost += gameData.players[game.users.two.socket.id].score;

		players[1].gameData.points.won += gameData.players[game.users.two.socket.id].score;
		players[1].gameData.points.lost += gameData.players[game.users.one.socket.id].score;

		players[0].gameData.gameDurationInSeconds.total += gameDurationInSeconds;
		players[1].gameData.gameDurationInSeconds.total += gameDurationInSeconds;

		if (!players[0].gameData.gameDurationInSeconds.shortest || players[0].gameData.gameDurationInSeconds.shortest > gameDurationInSeconds) {
			players[0].gameData.gameDurationInSeconds.shortest = gameDurationInSeconds;
		}
		if (!players[1].gameData.gameDurationInSeconds.shortest || players[1].gameData.gameDurationInSeconds.shortest > gameDurationInSeconds) {
			players[1].gameData.gameDurationInSeconds.shortest = gameDurationInSeconds;
		}
		if (!players[0].gameData.gameDurationInSeconds.longest || players[0].gameData.gameDurationInSeconds.longest < gameDurationInSeconds) {
			players[0].gameData.gameDurationInSeconds.longest = gameDurationInSeconds;
		}
		if (!players[1].gameData.gameDurationInSeconds.longest || players[1].gameData.gameDurationInSeconds.longest < gameDurationInSeconds) {
			players[1].gameData.gameDurationInSeconds.longest = gameDurationInSeconds;
		}
		const entry: GameEntity = this.gameRepository.create({
			id: id,
			duration: gameDuration,
			start: game.startTime,
			end: new Date(),
			players: players,
			data: {
				scores: game.scores,
				winner: game.winner
			}
		});
		await this.gameRepository.save(entry);
		await this.userService.save(players[0]);
		await this.userService.save(players[1]);
	}
	//the service needs to interact with the gateway to send updates to the users
	private async gameLoop(id: string) {
		if (this.games[id].goalReached) {
			Logger.log(`GAME[${id}] - GOAL REACHED`);
			this.gameGateway.sendFinished(id);
			clearInterval(this.gameIntervals[id]);
			await this.saveGameInDatabase(id);
			delete(this.games[id]);
			this.games[id] = undefined;
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


	async getHistoryOfUser(user: string) {

		const games = await this.gameRepository
		.createQueryBuilder("game")
		.innerJoinAndSelect("game.players", "players")
		// .where("players.intra_name = :id", {id: user})
		.getMany();

		Logger.log(`RAW HISTORY RESULTS: ${JSON.stringify(games)}`);
		let items: HistoryObject[] = [];
		for (const game of games) {
			if (game.data.scores.hasOwnProperty(user)) {
				let winner: UserEntity;
				let loser: UserEntity;
				if (game.players[0].intra_name === game.data.winner) {
					winner = game.players[0];
					loser = game.players[1];
				}
				else {
					loser = game.players[0];
					winner = game.players[1];
				}
				const item: HistoryObject = {
					winner: winner,
					opponent: loser,
					score: game.data.scores,
					duration: Math.floor(game.duration / 1000),
					date: game.start
				};
				items.push(item);
			}
		}
		Logger.log(`HISTORY OF USER: ${JSON.stringify(items)}`);
		return items;
	}
}

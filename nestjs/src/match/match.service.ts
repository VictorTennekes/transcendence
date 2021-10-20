import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import { User } from 'src/game/game.script';
import { GameService } from 'src/game/game.service';
import { Match, MatchSettings } from './match.class';

@Injectable()
export class MatchService {
	constructor(
		private readonly gameService: GameService,
	) {}

	matches: {[key: string] : Match} = {};

	deleteMatch(id: string) {
		delete(this.matches[id]);
		this.matches[id] = undefined;
	}

	createMatch(creator: User, settings: MatchSettings, privateFlag = false): string {
		let id = nanoid();
		this.matches[id] = new Match(id, creator, settings, privateFlag);
		return id;
	}

	//BUG: if two matches are started for the same user on different tabs, this will 'break'
	getMatchID(clientID: string) {
		for (const key in this.matches) {
			if (this.matches[key] !== undefined &&
				(this.matches[key].creator !== undefined && this.matches[key].creator.socket.id === clientID ||
				(this.matches[key].opponent !== undefined && this.matches[key].opponent.socket.id === clientID)))
				return key;
		}
		return null;
	}

	cancelMatch(client: Socket) {
		const id = this.getMatchID(client.id);
		if (!id) {
			Logger.log("GAME[] - NOT FOUND - USER[${client.id}]");
			return ;
		}
		Logger.log(`GAME[${id}] - CANCEL - USER[${client.id}]`);
		delete this.matches[id];
		this.matches[id] = undefined;
		client.leave(id);
	}

	decline(client: Socket) {
		const id = this.getMatchID(client.id);
		if (!id) { //error
			Logger.log("GAME[] - NOT FOUND - USER[${client.id}]");
			return ;
		}
		Logger.log(`GAME[${id}] - DECLINE - USER[${client.id}]`);
		client.leave(id);
	}

	createGame(id: string) {
		const match = this.matches[id];
		this.gameService.createGame(match);
	}

	excludedFromSearch(key: string) {
		const match = this.matches[key];
		if (match === undefined)
			return true;
		if (match.ready === true)
			return true;
		if (match.private === true)
			return true;
		return false;
	}

	matchExists(user: User, settings: MatchSettings) {
		//BUG: subsequent requests from the same user will make the creator and opponent the same user
		
		for (const key in this.matches) {
			//TODO: handle condition for opponent_username differently
			if (this.excludedFromSearch(key))
				continue ;
			if (this.matches[key].settingCompare(settings)) {
				this.matches[key].setOpponent(user);
				return (key);
			}
		}
		return null;
	}

	findMatch(user: User, settings: MatchSettings) {
		// console.log("findMatch");
		// console.log("all existing matches:")
		// console.log(this.matches);
		//BUG: subsequent requests from the same user will make the creator and opponent the same user
		for (const key in this.matches) {
			//TODO: handle condition for opponent_username differently
			//loop through all matches, trying to find a compatible match (based on 'settings')
			if (this.excludedFromSearch(key))
				continue ;
			if (this.matches[key].settingCompare(settings)) {
				this.matches[key].setOpponent(user);
				return (key);
			}
		}
		//no compatible match found, create one instead
		return (this.createMatch(user, settings));
	}

	acceptMatch(user: string) {
		const id = this.getMatchID(user);
		if (!id || !this.matches[id])
			return ;
		Logger.log(`ACCEPTING MATCH[${id}] AS USER = ${user}`);
		this.matches[id].setAccepted(user);
	}

	isAccepted(id: string) {
		return (this.matches[id]?.accepted);
	}
}

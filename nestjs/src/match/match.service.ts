import { Injectable, Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Observable } from 'rxjs';
import { User } from 'src/game/game.script';
import { GameService } from 'src/game/game.service';
import { Match, MatchSettings } from './match.class';
import { MatchGateway } from './match.gateway';

//Keep an array of matches internally, with a unique id

@Injectable()
export class MatchService {
	constructor(
		private readonly gameService: GameService,
	) {}

	matches: {[key: string] : Match} = {};

	createMatch(creator: User, settings: MatchSettings, privateFlag = false): string {
		let id = nanoid();
		this.matches[id] = new Match(id, creator, settings, privateFlag);
		return id;
	}

	getMatchID(clientID: string) {
		for (const key in this.matches) {
			if (this.matches[key] !== undefined && (this.matches[key].creator.id === clientID || this.matches[key].opponent.id === clientID))
				return key;
		}
		return null;
	}

	cancelMatch(clientID: string) {
		const id = this.getMatchID(clientID);
		if (!id) { //error
			return ;
		}
		delete this.matches[id];
		this.matches[id] = undefined;
	}

	createGame(id: string) {
		const match = this.matches[id];
		this.gameService.createGame(match);
	}

	//return the match (either found or created)
	// findExistingMatch(user: User, settings: MatchSettings): Match | null {
	// 	for (const matchKey in this.matches) {
	// 		if (this.matches[matchKey].opponent)
	// 	}
	// 	return null;
	// }

	matchExists(user: User, settings: MatchSettings) {
		//BUG: subsequent requests from the same user will make the creator and opponent the same user
		
		console.log("findMatch");
		console.log("all existing matches:")
		console.log(this.matches);
		for (const key in this.matches) {
			// console.log("findMatch");
			//TODO: handle condition for opponent_username differently
			//loop through all matches, trying to find a compatible match (based on 'settings')
			if (this.matches[key] === undefined || this.matches[key].ready || this.matches[key].private)
				continue ;
			if (this.matches[key].settingCompare(settings, user)) {
				this.matches[key].setOpponent(user);
				return (key);
			}
		}
		//no compatible match found, create one instead
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
			if (this.matches[key] === undefined || this.matches[key].ready || this.matches[key].private)
				continue ;
			if (this.matches[key].settingCompare(settings, user)) {
				this.matches[key].setOpponent(user);
				return (key);
			}
		}
		//no compatible match found, create one instead
		return (this.createMatch(user, settings));
	}

	findConnectedSocket(user: User, settings: MatchSettings) {
		//BUG: subsequent requests from the same user will make the creator and opponent the same user
		for (const key in this.matches) {
			console.log("findMatch");
			//loop through all matches, trying to find a compatible match (based on 'settings')
			if (this.matches[key] === undefined || this.matches[key].ready || this.matches[key].private)
				continue ;
			if (this.matches[key].settingCompare(settings, user)) {
				this.matches[key].setOpponent(user);
				return (key);
			}
		}
		//no compatible match found, emit error?
		return (null)
	}

	acceptMatch(user: string) {
		const id = this.getMatchID(user);
		if (!id || !this.matches[id])
			return ;
		this.matches[id].setAccepted(user);
	}

	isReady(id: string) {
		return this.matches[id]?.ready;
	}

	isAccepted(id: string) {
		return (this.matches[id]?.accepted);
	}
}

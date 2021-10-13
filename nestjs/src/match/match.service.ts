import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import { Observable } from 'rxjs';
import { User } from 'src/game/game.script';
import { GameService } from 'src/game/game.service';
import { Match, MatchSettings } from './match.class';
import { MatchGateway } from './match.gateway';
import e from 'express';

//Keep an array of matches internally, with a unique id

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
		console.log("create match");
		console.log("all existing matches");
		console.log(this.matches);
		let id = nanoid();
		this.matches[id] = new Match(id, creator, settings, privateFlag);
		console.log("all existing matches after create match");
		console.log(this.matches);
		return id;
	}

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
		if (!id) { //error
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
			// if (this.matches[key] === undefined || this.matches[key].ready || this.matches[key].private)
				// continue ;
			if (this.excludedFromSearch(key))
				continue ;
			if (this.matches[key].settingCompare(settings)) {
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
			if (this.excludedFromSearch(key))
				continue ;
			if (this.matches[key].settingCompare(settings)) {
				console.log("returning match");
				this.matches[key].setOpponent(user);
				console.log(this.matches[key]);
				return (key);
			}
			console.log("key: ", key);
			console.log("key: ", this.matches[key]);
		}
		//no compatible match found, create one instead
		console.log("create match from findmatch: ");
		return (this.createMatch(user, settings));
	}

	listenMatch(user: string) {
		const id = this.getMatchID(user);
		if (!id || !this.matches[id]) {
			Logger.log(`MATCH[] - LISTEN - USER[${user}]`);
			return ;
		}
		Logger.log(`MATCH[${id}] - LISTEN - USER[${user}]`);
		this.matches[id].setReady(user);
	}
	
	findConnectedSocket(user: User, settings: MatchSettings) {
		//BUG: subsequent requests from the same user will make the creator and opponent the same user
		for (const key in this.matches) {
			console.log("findMatch");
			//loop through all matches, trying to find a compatible match (based on 'settings')
			if (this.matches[key] === undefined || this.matches[key].ready || this.matches[key].private)
				continue ;
			if (this.matches[key].settingCompare(settings)) {
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

	areListening(id: string) {
		return this.matches[id]?.ready;
	}

	isAccepted(id: string) {
		return (this.matches[id]?.accepted);
	}
}

import { Injectable, Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Observable } from 'rxjs';
import { MatchGateway } from './match.gateway';

//Keep an array of matches internally, with a unique id

enum SpeedMode {
	SLOW,
	NORMAL,
	SANIC
};

export interface MatchSettings {
	powerups?: {
		speed: SpeedMode,
		//things
	}
};

class Match {
	private _creator: string;
	private _opponent: null | string = null;
	private _ready: boolean = false;
	private _accepted: {[key: string] : boolean} = {};

	constructor(
		private id: string,
		creator: string,
		private settings: MatchSettings,
		private _private = false)
	{
		this._creator = creator;
	}

	get creator() {
		return this._creator;
	}

	get opponent() {
		return this._opponent;
	}

	get ready() {
		return this._ready;
	}

	get private() {
		return this._private;
	}

	get accepted() {
		return (
			this._ready && 
			this._accepted[this.creator] === true &&
			this._accepted[this._opponent] === true);
	}

	setOpponent(opponent: string) {
		if (!!this._opponent) {
			//error;
		}
		this._opponent = opponent;
		this._accepted[this._opponent] = false;
		this._accepted[this.creator] = false;
		this._ready = true;
	}

	setAccepted(user: string) {
		this._accepted[user] = true;
	}

	settingCompare(setting: MatchSettings): boolean {
		if (this.settings?.powerups) {
			for (const item in this.settings.powerups) {
				if (!setting.powerups[item] || this.settings.powerups[item] != setting.powerups[item]) {
					return false;
				}
			}
			return true;
		}
		return true;
	}
}

@Injectable()
export class MatchService {
	constructor(
	) {}

	matches: {[key: string] : Match} = {};

	createMatch(creator: string, settings: MatchSettings, privateFlag = false): string {
		let id = nanoid();
		this.matches[id] = new Match(id, creator, settings, privateFlag);
		return id;
	}

	getMatchID(clientID: string) {
		for (const key in this.matches) {
			if (this.matches[key].creator === clientID || this.matches[key].opponent === clientID)
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

	//return the match (either found or created)
	findMatch(user: string, settings: MatchSettings) {
		//BUG: subsequent requests from the same user will make the creator and opponent the same user
		for (const key in this.matches) {
			//loop through all matches, trying to find a compatible match (based on 'settings')
			if (this.matches[key].ready || this.matches[key].private)
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
		this.matches[id].setAccepted(user);
	}

	isReady(id: string) {
		return this.matches[id]?.ready;
	}

	isAccepted(id: string) {
		return (this.matches[id]?.accepted);
	}
}

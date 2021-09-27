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

//might be missing an 'accepted' array, for when 'accept' button is pressed
class Match {
	private _creator: string;
	private opponent: null | string = null;
	private _ready: boolean = false;
	private _accepted: {[key: string] : boolean} = {};

	constructor(private id: string, creator: string, private settings: MatchSettings, private _private = false) {
		this._creator = creator;
	}

	get creator() {
		return this._creator;
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
			this._accepted[this.opponent] === true);
	}

	setOpponent(opponent: string) {
		if (!!this.opponent) {
			//error;
		}
		this.opponent = opponent;
		this._accepted[this.opponent] = false;
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
		private readonly server: MatchGateway
	) {}

	matches: {[key: string] : Match} = {};

	createMatch(creator: string, settings: MatchSettings, privateFlag = false): string {
		let id = nanoid();
		this.matches[id] = new Match(id, creator, settings, privateFlag);
		return id;
	}

	cancelMatch(id: string) {
		Logger.log(`CANCELED ${id}`);
		delete this.matches[id];
	}

	//return the match (either found or created)
	findMatch(user: string, settings: MatchSettings) {
		//BUG: subsequent requests from the same user will make the creator and opponent the same user
		for (const key in this.matches) {
			if (this.matches[key].ready || this.matches[key].private)
				continue ;
			if (this.matches[key].settingCompare(settings)) {
				this.matches[key].setOpponent(user);
				//BUG: need this delay to make sure the opponent also has time to listen for the event :sweat_smile:
				var interval = setInterval(() => {
					this.server.sendReady(key);
					var acceptTimer = setInterval(() => {
						//check if the match is accepted
						Logger.log(`MATCH ${key} SERVERSIDE ACCEPT CHECK!!`);
						const accepted: boolean = this.isAccepted(key);
						if (accepted) {
							//if the match is accepted, let the players know and create the gimma
							this.server.matchAccepted(key, true);
						}
						else {
							//match is not accepted by both players, let the players know
							this.server.matchAccepted(key, false);
						}
						clearInterval(acceptTimer);
					}, 10000);
					clearInterval(interval);
				},1000);
				return ({id: key});
			}
		}
		return ({
			id: this.createMatch(user, settings)
		});
	}

	acceptMatch(id: string, user: string) {
		if (!this.matches[id])
			return ;
		this.matches[id].setAccepted(user);
	}

	isAccepted(id: string) {
		return (this.matches[id]?.accepted);
	}
}

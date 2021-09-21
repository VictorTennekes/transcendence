import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Observable } from 'rxjs';

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
	private players: string[];
	private _accepted: boolean = false;

	constructor(private id: string, creator: string, private settings: MatchSettings, private _private = false) {
		this.players.push(creator);
	}

	get accepted() {
		return this._accepted;
	}

	get private() {
		return this._private;
	}

	setOpponent(opponent: string) {
		if (this.players.length >= 2) {
			//error
		}
		this.players.push(opponent);
		this._accepted = true;
	}

	settingCompare(setting: MatchSettings): boolean {
		if (this.settings.powerups) {
			for (const item in this.settings.powerups) {
				if (this.settings.powerups[item] != setting.powerups[item]) {
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
	constructor( ) {}

	matches: {[key: string] : Match}

	createMatch(creator: string, settings: MatchSettings, privateFlag = false): string {
		let id = nanoid();
		this.matches[id] = new Match(id, creator, settings, privateFlag);
		return id;
	}

	//probably needs a different name, as there is a difference between 'accepting' the match
	// and actually pressing the accept button on a queue-pop (which is done through the socket)
	acceptMatch(user: string, matchId: string) {
		this.matches[matchId].setOpponent(user);

		//notify the creator and the opponent that the match is accepted
	}

	//return the match (either found or created)
	async findMatch(user: string, settings: MatchSettings) {
		let found = false;

		for (const key in this.matches) {
			if (this.matches[key].accepted || this.matches[key].private)
				continue ;
			if (this.matches[key].settingCompare(settings)) {
				this.matches[key].setOpponent(user);
				found = true;
				break ;
			}
		}
		this.createMatch(user, settings);
	}
}

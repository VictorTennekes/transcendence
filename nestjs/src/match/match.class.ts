import { User } from "src/game/game.script";

export enum SpeedMode {
	SLOW,
	NORMAL,
	SANIC
};

export interface MatchSettings {
	powerups?: {
		speed: SpeedMode,
		//things
	}
	opponent_username?: string
};

export class Match {
	private _creator: User;
	private _opponent: User | null;
	private _ready: boolean = false;
	private _accepted: {[key: string] : boolean} = {};

	constructor(
		private _id: string,
		creator: User,
		private _settings: MatchSettings,
		private _private = false)
	{
		this._creator = creator;
	}

	get creator() {
		return this._creator;
	}

	get id() {
		return this._id;
	}

	get settings() {
		return this._settings;
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
			this._accepted[this.creator.id] === true &&
			this._accepted[this._opponent.id] === true);
	}

	setOpponent(opponent: User) {
		if (!!this._opponent) {
			//error;
		}
		this._opponent = opponent;
		this._accepted[this._opponent.id] = false;
		this._accepted[this.creator.id] = false;
		this._ready = true;
	}

	setAccepted(user: string) {
		this._accepted[user] = true;
	}

	settingCompare(setting: MatchSettings, user: User): boolean {
		console.log("setting compare");
		console.log(setting);
		if (setting.opponent_username) {
			console.log("username exists: ", setting.opponent_username);
			console.log("user username: ", user.login);
			if (setting?.opponent_username !== this._creator.login) {
				return false;
			}
		}
		if (this._settings?.powerups) {
			for (const item in this._settings.powerups) {
				if (!setting.powerups[item] || this._settings.powerups[item] != setting.powerups[item]) {
					return false;
				}
			}
			return true;
		}
		return true;
	}
}

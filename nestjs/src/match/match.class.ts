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
};

export class Match {
	private _creator: string;
	private _opponent: null | string = null;
	private _ready: boolean = false;
	private _accepted: {[key: string] : boolean} = {};

	constructor(
		private _id: string,
		creator: string,
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

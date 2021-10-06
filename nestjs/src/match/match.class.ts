import { User } from "src/game/game.script";

export enum SpeedMode {
	NORMAL,
	FAST,
	SANIC
};

export enum EndConditionTypes {
	POINT,
	TIME
};

export interface EndCondition {
	type: EndConditionTypes,
	value: number
};

export interface MatchSettings {
	endCondition: EndCondition,
	ballSpeed: SpeedMode
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

	settingCompare(setting: MatchSettings): boolean {
		return (this.settings.ballSpeed == setting.ballSpeed &&
			this.settings.endCondition.type == setting.endCondition.type &&
			this.settings.endCondition.value == setting.endCondition.value);
	}
}

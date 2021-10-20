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
	powerups?: {
		speed: SpeedMode,
		//things
	}
	opponent_username?: string
};

export class Match {
	private _creator: User;
	private _opponent: User | null;
	// private _listening: {[key: string] : boolean} = {};
	private _listening: boolean = false;
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
		// return (this._listening[this.creator.socket.id] && this._listening[this.opponent.socket.id]);
		return this._listening;
	}

	get private() {
		return this._private;
	}

	get accepted() {
		return (
			this.ready && 
			this._accepted[this.creator.socket.id] === true &&
			this._accepted[this._opponent.socket.id] === true);
	}

	bothDidntAccept(): boolean {
		return (this._accepted[this._creator.socket.id] === this._accepted[this.opponent.socket.id]);
	}

	resetMatchData() {
		// this._listening = {};
		this._listening = false;
		if (this._accepted[this._creator.socket.id]) {
			this._opponent = undefined;
		}
		else {
			this._creator = this._opponent;
			this._opponent = undefined;
		}
		this._accepted = {};
	}

	userAccepted(user: User) {
		return this._accepted[user.socket.id];
	}

	setOpponent(opponent: User) {
		if (!!this._opponent) {
			return ;
		}
		this._opponent = opponent;
		this._accepted[this._opponent.socket.id] = false;
		this._accepted[this.creator.socket.id] = false;
		// this._ready = true;
		this._listening = true;
	}

	setReady(socketid: string) {
		this._listening[socketid] = true;
	}

	setAccepted(socketid: string) {
		this._accepted[socketid] = true;
	}

	//needs to return false if setting.opponent_username is set and the opponent doesnt match the creator
	settingCompare(setting: MatchSettings): boolean {
		const base_settings_match = setting?.opponent_username !== this._creator.login && this.settings.ballSpeed == setting.ballSpeed &&
			this.settings.endCondition.type == setting.endCondition.type &&
			this.settings.endCondition.value == setting.endCondition.value;

		if (setting.opponent_username) {
			return (setting.opponent_username === this.creator.login && base_settings_match);
		}
		return base_settings_match;
	}
}

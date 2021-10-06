import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameSocket } from './game/game.socket';
import { MatchSocket } from './match/match.socket';
// import { Socket } from 'ngx-socket-io';

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

export const defaultMatchSettings: MatchSettings = {
	endCondition: {
		type: EndConditionTypes.POINT,
		value: 5
	},
	ballSpeed: SpeedMode.NORMAL
};

@Injectable({
	providedIn: 'root'
})
export class MatchService {
	constructor(
		private readonly matchSocket: MatchSocket,
		private readonly http: HttpClient,
		private readonly gameSocket: GameSocket
	) { }
	
	//emit the find request with these settings
	findMatch(settings: MatchSettings) {
		this.matchSocket.emit('find', settings);
	}

	cancelMatch() {
		this.matchSocket.emit('cancel');
	}

	matchReady() {
		return this.matchSocket.fromEvent('ready');
	}

	matchAccepted() {
		return this.matchSocket.fromEvent('accepted');
	}

	acceptMatch() {
		this.matchSocket.emit('accept');
	}
}

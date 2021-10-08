import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameSocket } from './game/game.socket';
import { MatchSocket } from './match/match.socket';
import { QueueScheduler } from 'rxjs/internal/scheduler/QueueScheduler';
import { QueueService } from './queue.service';
import { AcceptService } from './accept.service';
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

	acceptListener: Observable<any>;
	constructor(
		private readonly matchSocket: MatchSocket,
		private readonly http: HttpClient,
		private readonly gameSocket: GameSocket,
		// private readonly queueService: QueueService,
		private readonly acceptService: AcceptService
	) {
		this.acceptListener = this.matchSocket.fromEvent('accepted');
	}
	
	//emit the find request with these settings
	findMatch(settings: MatchSettings) {
		this.matchSocket.emit('find', settings);
	}

	decline() {
		this.matchSocket.emit('decline');
	}

	cancelMatch() {
		this.matchSocket.emit('cancel');
	}

	matchReady() {
		return this.matchSocket.fromEvent('ready');
	}
	cancelReady() {
		this.matchSocket.removeAllListeners('ready');
	}
	// cancelAccept() {
	// 	this.matchSocket.removeAllListeners('accepted');
	// }

	sendListen() {
		this.matchSocket.emit('listen');
	}
	matchAccepted() {
		return this.acceptListener;
	}

	acceptMatch() {
		this.matchSocket.emit('accept');
	}
}

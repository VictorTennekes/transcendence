import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameSocket } from './game/game.socket';
// import { Socket } from 'ngx-socket-io';

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

@Injectable({
	providedIn: 'root'
})
export class MatchService {

	id: string | null = null;

	constructor(
		private readonly http: HttpClient,
		private readonly socket: GameSocket
	) { }
	
	//emit the find request with these settings
	findMatch(settings: MatchSettings) {
		this.socket.emit('find', settings);
	}

	cancelMatch() {
		console.log(`CANCELING MATCH ${this.id}`);
		this.http.get('api/match/cancel/' + this.id).subscribe(() => {});
	}

	acceptMatch() {
		console.log(`ACCEPTING MATCH ${this.id}`);
		return this.http.get('api/match/accept/' + this.id);
	}

	matchAccepted() {
		return this.socket.fromOneTimeEvent(`accepted${this.id}`);
	}
}

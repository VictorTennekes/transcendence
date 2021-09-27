import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';

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
		private readonly socket: Socket
	) { }
	
	//this response contains an id, that I'm gonna need in further requests
	findMatch(settings: MatchSettings) {
		return this.http.post('api/match/find', settings).pipe(map((res: any) => {
			this.id = res.id as string;
			return res.id;
		}));
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

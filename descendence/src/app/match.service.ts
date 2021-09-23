import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
		private readonly http: HttpClient
	) { }
	
	//this response contains an id, that I'm gonna need in further requests
	findMatch(settings: MatchSettings) {
		return this.http.post('api/match/find', settings).pipe(map((res: any) => {
			this.id = res.id as string;
			return res.id;
		}));
	}

	acceptMatch() {
		console.log(`ACCEPTING MATCH ${this.id}`);
		this.http.get('api/match/accept/' + this.id).subscribe(() => {});
	}

	matchAccepted() {
		console.log(`MATCH ${this.id} IS:`);
		if (this.id) {
			return this.http.get('api/match/accepted/' + this.id);
		}
		else {
			return of('false');
		}
	}
}

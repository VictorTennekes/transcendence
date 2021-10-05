import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class GameService {
	
	constructor(
		private readonly http: HttpClient
	) { }

	matchOngoing(id: string) {
		return this.http.get('api/match/ongoing/' + id).pipe(map((value) => {
			return !!value;
		}));
	}

	get(id: string) {
		return this.http.get('api/match/' + id);
	}

	matchFinished(id: string) {
		return this.http.get('api/match/finished/' + id).pipe(map((value) => {
			return !!value;
		}));
	}

	async matchData() {
		return this.http.get('match/@me');
	}
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameHistory } from './profile/history/history.component';
import { PostGameData } from './postgame.resolver';

@Injectable({
	providedIn: 'root'
})
export class GameService {
	
	constructor(
		private readonly http: HttpClient
	) { }

	getHistoryOfUser(user: string): Observable<GameHistory[]> {
		return this.http.get<GameHistory[]>('api/match/history/' + user);
	}
	matchOngoing(id: string) {
		return this.http.get('api/match/ongoing/' + id).pipe(map((value) => {
			return !!value;
		}));
	}

	get(id: string): Observable<PostGameData> {
		return this.http.get<PostGameData>('api/match/' + id);
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

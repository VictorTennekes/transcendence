import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class GameService {
	
	constructor(
		private readonly http: HttpClient
	) { }
	async matchData() {
		return this.http.get('match/@me');
	}
}

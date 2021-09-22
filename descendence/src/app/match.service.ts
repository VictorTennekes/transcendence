import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class MatchService {
	
	constructor(
		private readonly http: HttpClient
	) { }
	
	findMatch() {
		return this.http.post('api/match/find', {});
	}
}

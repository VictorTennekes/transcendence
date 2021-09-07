import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';


interface User {
	intraName: string;
	displayName: string;
	avatarUrl: string | null;
}

@Injectable({
	providedIn: 'root'
})
export class UserService {
	userSource = new BehaviorSubject<any>(0);
	userSubject: Observable<User>;
	constructor(
		private readonly http: HttpClient
	) {
		this.userSubject = this.userSource.pipe(switchMap(() => this.http.get<User>('/api/user/fetch_current')));
	}
}

//call userSource.next('') to send updates to the subscriptions;
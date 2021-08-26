import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, switchMap, take } from 'rxjs/operators';

// interface User {
// 	intraName: string;
// 	displayName: string;
// 	avatarUrl: string | null;
// }

@Injectable({
	providedIn: 'root'
})
export class UserService {
	userSource = new BehaviorSubject<any>('');
	userSubject: Observable<any>;
	constructor(
		private readonly http: HttpClient
	) {
		this.userSubject = this.userSource.pipe(switchMap(() => {
			return this.http.get('/api/user/fetch_current');
		}));
	}

	updateDisplayName(newDisplayName: string): void {
		console.log(`new name: ${newDisplayName}`);
		this.http.post('api/user/update_display_name', {display_name: newDisplayName}).subscribe(() => {});
		this.userSource.next('');
	}
	getCurrentUser(): any {
		return this.http.get('api/user/fetch_current').pipe(take(1));
	}

	logout(): any {
		return this.http.get('api/auth/logout').pipe(take(1));
	}
}

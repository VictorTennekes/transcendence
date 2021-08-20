import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, take } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	
	constructor( private readonly http: HttpClient) { }

	updateDisplayName(newDisplayName: string): void {
		console.log(`new name: ${newDisplayName}`);
		this.http.post('api/user/update_display_name', {display_name: newDisplayName}).subscribe(() => {});
	}
	getCurrentUser(): any {
		return this.http.get('api/user/fetch_current').pipe(take(1));
	}

	logout(): any {
		return this.http.get('api/auth/logout').pipe(take(1));
	}
}

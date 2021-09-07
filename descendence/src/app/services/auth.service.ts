import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CookieService} from 'ngx-cookie-service';

export class LoginData {
	constructor(
		public id: number,
		public name: string) { }
	}
	
@Injectable({
	providedIn: 'root'
})
export class AuthService {
	constructor(
		private cookie: CookieService,
		private _router: Router,
		private http: HttpClient
	) {}

	isLoggedIn(twoFactorRequired: boolean = true) {
		return this.http.get('api/auth/@session').pipe(map((res: any) => {
			let result = true;
			if (!res.user) {
				result = false;
			}
			if (twoFactorRequired && res.two_factor_enabled && !res.two_factor_passed) {
				result = false;
			}
			return result;
		}),catchError((error) => {
			return of(false);
		}));
	}

	async getQRCode() {
		return this.http.get('api/2fa/generate');
	}

	authenticate(code: string) {
		return this.http.post('api/2fa/authenticate', {code: code});
	}

	validateQRCode(code: string) {
		return this.http.post('api/2fa/turn-on', {code: code});
	}

	logout() {
		this.cookie.delete('access_token');
		this._router.navigate(['/login']);
	}
}

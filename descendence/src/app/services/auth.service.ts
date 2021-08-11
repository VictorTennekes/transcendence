import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
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
		private _http: HttpClient
	) {}
	
	obtainAccessToken(loginData: any){
		let params = new URLSearchParams();
		params.append('intra_name',loginData.username);
		let headers = 
		new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
		'Authorization': 'Basic '+btoa("fooClientIdPassword:secret")});
		
		this._http.post('http://localhost:3000/user/login', params.toString(), { headers: headers})
		.pipe(
		map((res: any) => res.json()))
		.subscribe(
			(data) => this.saveToken(data),
			(err) => alert('Invalid Credentials')
		);
	}

	saveToken(token: any) {
		var expireDate = new Date().getTime() + (1000 * token.expires_in);
		this.cookie.set("access_token", token.access_token, expireDate);
		this._router.navigate(['/']);
	}
	
	getResource(resourceUrl: string) : Observable<LoginData>{
		var headers = 
		new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
		'Authorization': 'Bearer '+ this.cookie.get('access_token')});
		var options = { headers: headers };
		return this._http.get(resourceUrl, options)
		.pipe(map((res: any) => res.json()),
		catchError((error, caught) => {
		return (throwError(error.json().error || 'Server error'));}));
	}

	checkCredentials(){
		if (this.cookie.check("access_token")){
			this._router.navigate(['/login']);
		}
	}

	logout() {
		this.cookie.delete('access_token');
		this._router.navigate(['/login']);
	}
}

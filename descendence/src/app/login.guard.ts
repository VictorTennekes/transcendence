import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class LoginGuard implements CanActivate {

	constructor(
		private cookies: CookieService,
		private router: Router
		) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		const keyExists = this.cookies.hasKey('connect.sid');
		if (!keyExists)
		{
			this.router.navigateByUrl('/home');
			return (false);
		}
		return true;
	}
}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Injectable({
	providedIn: 'root'
})
export class TwoFactorGuard implements CanActivate {

	constructor(
		private authService: AuthService,
		private router: Router
	) {}
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return this.authService.isLoggedIn(false).pipe(map((result) => {
			if (!result) {
				this.router.navigate(['/home']);
			}
			return result;
		}),catchError(error => of(false)));
	}
}

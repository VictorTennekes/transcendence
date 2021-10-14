import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from '../user.service';

@Injectable({
	providedIn: 'root'
})
export class ProfileGuard implements CanActivate {
	constructor(
		private readonly userService: UserService,
		private readonly route: ActivatedRoute,
		private readonly router: Router
	) {}
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
			console.log(route.params['id']);
			return this.userService.getUserByLogin(route.params['id']).pipe(map((user) => {
				if (!user) {
					this.router.navigate(['play']);
					return false;
				}
				return true;
			}),catchError(err => of(false)));
	}
}

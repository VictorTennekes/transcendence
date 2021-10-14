import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root'
})
export class SetupGuard implements CanActivate {
	constructor(
		private readonly userService: UserService,
		private readonly router: Router
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
			return this.userService.getCurrentUser().pipe(map((user: any) => {
				if (user.display_name === null) {
					this.router.navigate(['setup']);
					return false;
				}
				return true;
			}),catchError(error => of(false)));
		}
}

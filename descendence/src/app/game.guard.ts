import { CanActivate, UrlTree, ActivatedRoute, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GameService } from './game.service';
import { catchError, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class GameGuard implements CanActivate {

	constructor(
		private readonly gameService: GameService,
		private readonly router: Router
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return this.gameService.matchOngoing(route.params.id).pipe(map((result: boolean) => {
			if (!result) {
				this.router.navigate(['play']);
			}
			return result;
		}),catchError(error => of(false)));
	}
};

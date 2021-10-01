import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class PostGameGuard implements CanActivate {

	constructor(
		private readonly gameService: GameService,
		private readonly router: Router
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return this.gameService.matchFinished(route.params.id).pipe(map((result: boolean) => {
			console.log(`POSTGAMEGUARD - ${result}`);
			if (!result) {
				this.router.navigate(['play']);
				return false;
			}
			return result;
		}),catchError(error => of(false)));
	}
};

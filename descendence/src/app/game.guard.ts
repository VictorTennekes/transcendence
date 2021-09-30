import { CanActivate, UrlTree, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class GameGuard implements CanActivate {

	constructor(
		gameService: GameService
	) {}

	canActivate(
		route: ActivatedRoute,
		state: RouterStateSnapshot
	) : Observable<boolean | UrlTree> {
		return this.
	}
};

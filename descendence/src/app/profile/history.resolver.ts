import { Injectable } from '@angular/core';
import {
	Router, Resolve,
	RouterStateSnapshot,
	ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { GameService } from '../game.service';
import { UserService } from '../user.service';
import { GameHistory } from './history/history.component';

@Injectable({
	providedIn: 'root'
})
export class HistoryResolver implements Resolve<GameHistory[]> {

	constructor(
		private readonly gameService: GameService,
		private readonly userService: UserService
	) {}
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<GameHistory[]> {

		return this.gameService.getHistoryOfUser(route.parent?.params['id']).pipe(map((history: GameHistory[]) => {
			for (let item of history) {
				item.date = new Date(item.date);
			}
			return history;
			// return of(history);
		}));
	}
}

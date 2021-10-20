import { Injectable } from '@angular/core';
import {
	Router, Resolve,
	RouterStateSnapshot,
	ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService, UserStats } from '../user.service';

@Injectable({
	providedIn: 'root'
})
export class StatsResolver implements Resolve<UserStats> {

	constructor(
		private readonly userService: UserService
	) {}
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserStats> {
		return this.userService.getStatsOfUser(route.parent?.params['id']);
	}
}

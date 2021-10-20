import { Injectable } from '@angular/core';
import {
	Router, Resolve,
	RouterStateSnapshot,
	ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatchService } from './match.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root'
})
export class IngameResolver implements Resolve<string | null> {
	constructor(
		private readonly userService: UserService,
	) {}
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string | null> {
		return this.userService.inGame().pipe(map((object: any) => {
			return object.id;
		}))
	}
}

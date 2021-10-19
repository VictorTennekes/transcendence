import { Injectable } from '@angular/core';
import {
	Router, Resolve,
	RouterStateSnapshot,
	ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../user.service';

@Injectable({
	providedIn: 'root'
})
export class OnlineResolver implements Resolve<boolean> {
	constructor(
		private readonly userService: UserService
	) {}
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		return this.userService.isOnline(route.params['id']);
	}
}

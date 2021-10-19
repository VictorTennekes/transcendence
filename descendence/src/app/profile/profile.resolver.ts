import { Injectable } from '@angular/core';
import {
	Router, Resolve,
	RouterStateSnapshot,
	ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserEntity, UserService } from '../user.service';

@Injectable({
	providedIn: 'root'
})
export class ProfileResolver implements Resolve<UserEntity> {
	constructor(
		private readonly userService: UserService
	) {}
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserEntity> {
		return this.userService.getUserByLogin(route.params['id']);
	}
}

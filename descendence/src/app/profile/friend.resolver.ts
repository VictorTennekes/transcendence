import { Injectable } from '@angular/core';
import {
	Router, Resolve,
	RouterStateSnapshot,
	ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserEntity, UserService } from '../user.service';

@Injectable({
	providedIn: 'root'
})
export class FriendResolver implements Resolve<boolean> {
	constructor(
		private readonly userService: UserService,
	) {}
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		const currentUser = this.userService.userSourceValue;
		return this.userService.getFriends(currentUser.intra_name).pipe(map((friends: UserEntity[]) => {
			const isFriend = friends.some((user) => user.intra_name === route.params['id']);
			return isFriend;
		}));
	}
}

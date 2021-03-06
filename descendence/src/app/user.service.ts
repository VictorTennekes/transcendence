import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { userModel } from './chat/chat-client/message.model';
import { first, map, switchMap, take } from 'rxjs/operators';
import { MatchService } from './match.service';

// interface User {
// 	intraName: string;
// 	displayName: string;
// 	avatarUrl: string | null;
// }

export interface UserStats {
	ballHits: number,
	games: {
		won: number,
		lost: number
	},
	points: {
		won: number,
		lost: number,
	},
	gameDurationInSeconds: {
		total: number,
		shortest: number | null,
		longest: number | null
	}
};

export interface UserEntity {
	display_name: string;
	intra_name: string
};

@Injectable({
	providedIn: 'root'
})
export class UserService {
	private userSource: BehaviorSubject<any> = new BehaviorSubject<any>('');
	private friendSource: BehaviorSubject<any> = new BehaviorSubject<any>('');
	userSubject: Observable<any>;
	friendSubject: Observable<UserEntity[]>;
	constructor(
		private readonly http: HttpClient,
		private readonly matchService: MatchService
	) {
		this.userSubject = this.userSource.pipe(switchMap(() => {
			return this.http.get('/api/user/fetch_current');
		}));
		this.friendSubject = this.friendSource.pipe(switchMap(() => {
			return this.http.get<UserEntity[]>('/api/user/friends');
		}));
	}

	isOnline(user: string) {
		return this.http.get<boolean>('/api/match/online/' + user);
	}

	inGame() {
		return this.http.get('/api/match/ingame');
	}

	get userSourceValue() {
		return this.userSource.value;
	}
	updateUserSource() {
		this.userSource.next('');
	}
	updateFriendSource() {
		this.friendSource.next('');
	}

	isBlocked(user: string): Observable<boolean> {
		return this.http.get<boolean>('/api/user/blocked/' + user);
	}

	isFriend(user: string): Observable<boolean> {
		return this.http.get<boolean>('/api/user/friend/' + user);
	}

	checkDisplayNameAvailability(newDisplayName: string) {
		return this.http.post('api/user/check_display_name', {display_name: newDisplayName});
	}

	getStatsOfUser(user: string): Observable<UserStats> {
		return this.http.get<UserStats>('api/user/stats/' + user);
	}

	updateDisplayName(newDisplayName: string) {
		return this.http.post('api/user/update_display_name', {display_name: newDisplayName}).pipe(map(() => {this.userSource.next('');}));
	}

	updateTwoFactor(newState: boolean): void {
		this.http.post('api/user/update_two_factor', {two_factor_enabled: newState}).subscribe(() => {this.userSource.next('');});
	}

	getCurrentUser(): any {
		return this.http.get('api/user/fetch_current').pipe(take(1));
	}

	getUserByLogin(login: string): Observable<UserEntity> {
		return this.http.post<UserEntity>('api/user/get', {login});
	}

	getUsersByLogins(logins: string[]): Observable<UserEntity[]> {
		return this.http.post<UserEntity[]>('api/user/get_multiple', {logins});
	}

	logout(): any {
		return this.http.get('api/auth/logout').pipe(take(1));
	}

	userExists(username: string) {
		// console.log(`USEREXISTS - ${username}`);
		return this.http.get('api/user/user_exists/' + username);
	}

	addBlockedUser(username: string) {
		this.matchService.friendRemoved(username);
		return this.http.post('api/user/block_user/', {username: username});
	}

	unblockedUser(username: string) {
		return this.http.post('api/user/unblock_user/', {username: username}).subscribe(() => {this.userSource.next('');});
	}

	addFriend(username: string) {
		return this.http.post('api/user/add_friend/', {username: username});
	}

	getFriends(username: string): Observable<userModel[]> {
		return this.http.get<userModel[]>('api/user/get_friends/' + username);
	}

	removeFriend(username: string) {
		this.http.post('api/user/unfriend/', {username: username}).subscribe(() => {this.userSource.next('');});
		this.matchService.friendRemoved(username);
	}

	getBlockedByUser(): Observable<userModel[]> {
		return this.http.get<userModel[]>('api/user/get_blocked_by_users');
	}
}

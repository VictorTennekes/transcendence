import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MatchSocket } from './match/match.socket';
import { QueueService } from './queue.service';
import { userModel } from './chat/chat-client/message.model'
import { AcceptComponent } from './accept/accept.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

export enum SpeedMode {
	NORMAL,
	FAST,
	SANIC
};

export enum EndConditionTypes {
	POINT,
	TIME
};

export interface EndCondition {
	type: EndConditionTypes,
	value: number
};

export interface MatchSettings {
	endCondition: EndCondition,
	ballSpeed: SpeedMode
	opponent_username?: string
};

export const defaultMatchSettings: MatchSettings = {
	endCondition: {
		type: EndConditionTypes.POINT,
		value: 5
	},
	ballSpeed: SpeedMode.NORMAL
};

@Injectable({
	providedIn: 'root'
})
export class MatchService {

	acceptListener: Observable<any>;
	errorListener: Observable<any>
	matchInviteListener: Observable<any>
	readyListener: Observable<any>
	public acceptDialog: any = null;
	private readySubscription: Subscription | null = null;

	acceptNotifier: Observable<any>;
	removeNotifier: Observable<any>;
	constructor(
		private readonly matchSocket: MatchSocket,
		private readonly dialog: MatDialog,
		private readonly router: Router,
		private readonly queueService: QueueService,
	) {
		this.acceptListener = this.matchSocket.fromEvent('accepted');
		this.errorListener = this.matchSocket.fromEvent('game_invite_failure');
		this.matchInviteListener = this.matchSocket.fromEvent('receive_game_invite');
		this.readyListener = this.matchSocket.fromEvent('ready');

		// this.inviteReadyListen();
		this.acceptNotifier = this.matchSocket.fromEvent('friend-accepted');
		this.removeNotifier = this.matchSocket.fromEvent('friend-removed');
	}

	findMatch(settings: MatchSettings) {
		this.matchSocket.emit('find', settings);
	}

	refreshConnection() {
		this.matchSocket.emit('refresh_connection');
	}

	decline() {
		this.matchSocket.emit('decline');
	}

	inviteUser(settings: MatchSettings) {
		console.log(`INVITING ${settings.opponent_username} FOR A MATCH`);
		this.matchSocket.emit('invite_user', settings);
	}

	cancelMatch() {
		this.matchSocket.emit('cancel');
	}

	matchAccepted() {
		return this.acceptListener;
	}

	inviteReadyListen() {
		if (this.readySubscription != null) {
			this.readySubscription.unsubscribe();
		};
		this.readySubscription = this.readyListener.subscribe(() => {
			let acceptDialog = this.dialog.open(AcceptComponent, {
				panelClass: 'two-factor-panel',
				disableClose: true,
				height: 'auto'
			});
			acceptDialog.afterClosed().subscribe((res: {result: boolean, self: boolean, id: string}) => {
				console.log("SUBSCRIPTION INSIDE INVITE READY LISTEN");
				console.log(res.result);
				if (res.result) {
					this.router.navigate(['game/' + res.id]);
				}
			});
		});
	}

	matchReadyListen(user: string | null) {
		if (this.readySubscription != null) {
			this.readySubscription.unsubscribe();
		};
		this.readySubscription = this.readyListener.subscribe(() => {
			let acceptDialog = this.dialog.open(AcceptComponent, {
				panelClass: 'two-factor-panel',
				disableClose: true,
				height: 'auto'
			});
			acceptDialog.afterClosed().subscribe((res: {result: boolean, self: boolean, id: string}) => {
				console.log("SUBSCRIPTION INSIDE MATCH READY LISTEN");
				console.log(res.result);
				if (res.result) {
					if (user === null) {
						this.queueService.close();
					}
					this.router.navigate(['game/' + res.id]);
				}
				else {
					if (!res.self && user === null) {
						this.queueService.close();
					}
				}
			});
		});
	}

	unsetReadyListen() {
		if (this.readySubscription != null) {
			this.readySubscription.unsubscribe();
		};
		this.readySubscription = null;
	}

	acceptMatch() {
		this.matchSocket.emit('accept');
	}

	receiveFriendRequestError() {
		return this.matchSocket.fromEvent('friend_request_failure');
	}

	inviteDeclined(username: string) {
		this.matchSocket.emit('invite_declined', username);
	}

	requestOnlineFriends() {
		this.matchSocket.emit('connected_friends');
	}

	friendDisconnected(): Observable<userModel> {
		return this.matchSocket.fromEvent('friend_disconnected');
	}

	friendConnected(): Observable<userModel> {
		return this.matchSocket.fromEvent('friend_connected');
	}

	friendInGame(): Observable<userModel> {
		return this.matchSocket.fromEvent('friend_in_game');
	}

	receiveFriendRequest(): Observable<userModel> {
		return this.matchSocket.fromEvent('receive-friend-request');
	}

	acceptFriendRequest(user: any): void {
		this.matchSocket.emit('accept-friend-request', user);
	}

	declineFriendRequest(user: any): void {
		this.matchSocket.emit('decline-friend-request', user);
	}

	sendFriendRequest(username: string): void {
		this.matchSocket.emit('send-friend-request', username);
	}

	friendRemoved(username: string): void {
		this.matchSocket.emit('remove-friend', username);
	}
}

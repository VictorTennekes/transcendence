import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameSocket } from './game/game.socket';
import { MatchSocket } from './match/match.socket';
import { QueueScheduler } from 'rxjs/internal/scheduler/QueueScheduler';
import { QueueService } from './queue.service';
import { AcceptService } from './accept.service';
import { userModel } from './chat/chat-client/message.model'
import { timeStamp } from 'console';
// import { Socket } from 'ngx-socket-io';

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
	powerups?: {
		speed: SpeedMode,
		//things
	}
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
	acceptNotifier: Observable<any>;
	removeNotifier: Observable<any>;
	constructor(
		private readonly matchSocket: MatchSocket,
		private readonly http: HttpClient,
		private readonly gameSocket: GameSocket,
		// private readonly queueService: QueueService,
		private readonly acceptService: AcceptService
	) {
		this.acceptListener = this.matchSocket.fromEvent('accepted');
		this.acceptNotifier = this.matchSocket.fromEvent('friend-accepted');
		this.removeNotifier = this.matchSocket.fromEvent('friend-removed');
	}

	//emit the find request with these settings
	findMatch(settings: MatchSettings) {
		this.matchSocket.emit('find', settings);
	}

	decline() {
		this.matchSocket.emit('decline');
	}

	inviteUser(settings: MatchSettings) {
		this.matchSocket.emit('invite_user', settings);
	}

	cancelMatch() {
		this.matchSocket.emit('cancel');
	}

	matchReady() {
		return this.matchSocket.fromEvent('ready');
	}
	cancelReady() {
		this.matchSocket.removeAllListeners('ready');
	}
	// cancelAccept() {
	// 	this.matchSocket.removeAllListeners('accepted');
	// }

	sendListen() {
		this.matchSocket.emit('listen');
	}
	matchAccepted() {
		return this.acceptListener;
	}

	acceptMatch() {
		this.matchSocket.emit('accept');
	}

	receiveGameInvite() {
		return this.matchSocket.fromEvent('receive_game_invite');
	}

	receiveGameInviteError() {
		return this.matchSocket.fromEvent('game_invite_failure');
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

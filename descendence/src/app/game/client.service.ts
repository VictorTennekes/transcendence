import { Injectable } from '@angular/core';
import { MatchSocket } from '../match/match.socket';
import { GameSocket } from './game.socket';
// import { Socket } from 'ngx-socket-io';

interface PlayerData {
	keysPressed: boolean[];
}

interface GameData {
	
};

@Injectable({
	providedIn: 'root'
})
export class ClientService {
	initialized: boolean = false;
	constructor(
		private readonly socket: MatchSocket,
	) {
	}

	sendPlayerData(data: PlayerData, ) {
		this.socket.emit('sendPlayerData', data);
	}

	receiveGameData() {
		return this.socket.fromEvent('gamedata');
	}

	pressUp() {
		this.socket.emit('press_up', {});
	}
	pressDown() {
		this.socket.emit('press_down', {});
	}
	releaseUp() {
		this.socket.emit('release_up', {});
	}
	releaseDown() {
		this.socket.emit('release_down', {});
	}
}

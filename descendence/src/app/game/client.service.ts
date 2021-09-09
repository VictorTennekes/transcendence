import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

interface PlayerData {
	verticalPosition: number;
};

interface GameData {
	playerOne: PlayerData;
	playerTwo: PlayerData;
};

@Injectable({
	providedIn: 'root'
})
export class ClientService {
	playerNumber: string;
	initialized: boolean = false;
	constructor(
		private readonly socket: Socket,
	) {
	}

	sendPlayerData(data: PlayerData, ) {
		this.socket.emit('sendPlayerData' + , data);
	}

	connect() {
		this.socket.on('connection', (data: any) => {
			this.playerNumber = data.playerNumber;
		})
	}

	// initializeGame() {
	// 	this.socket.fromEvent('initialize').subscribe((playerNumber: any) => {
	// 		this.playerNumber = playerNumber;
	// 	})
	// }
}

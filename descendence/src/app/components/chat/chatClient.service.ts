import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";

@Injectable({
	providedIn: 'root'
})
export class ChatClientService {
	constructor(private socket: Socket) {}

	sendChat(message: string) {
		this.socket.emit('chat', message);
	}

	receiveChat() {
		let msg = this.socket.fromEvent('chat');
		console.log("received message: ", msg);
		return msg;
	}

	getUsers() {
		return this.socket.fromEvent('users');
	}
}
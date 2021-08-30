import { Injectable } from "@angular/core";
import { retMessage, newMessage } from "./message.model";
import { Observable } from "rxjs";
import { Socket } from "ngx-socket-io";

@Injectable()
export class ChatService {
	constructor(private socket: Socket) {}

	sendMessage(message: newMessage) {
		this.socket.emit('send_message', message);
	}
	
	receiveMessages(): Observable<retMessage> {
		return this.socket.fromEvent('receive_message');
	}
}

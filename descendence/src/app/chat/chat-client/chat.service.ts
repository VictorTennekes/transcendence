import { Injectable } from "@angular/core";
import { retMessage, newMessage, chatModel } from "./message.model";
import { Observable } from "rxjs";
import { Socket } from "ngx-socket-io";
import { ChatSocket } from "../chat.socket";

@Injectable()
export class ChatService {
	constructor(private socket: ChatSocket) {}

	sendMessage(message: newMessage) {
		this.socket.emit('send_message', message);
	}
	
	receiveMessages(): Observable<retMessage> {
		return this.socket.fromEvent('receive_message');
	}

	listenForError(): Observable<string> {
		return this.socket.fromEvent('send_message_error');
	}
}

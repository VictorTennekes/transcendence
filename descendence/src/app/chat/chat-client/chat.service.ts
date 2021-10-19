import { Injectable } from "@angular/core";
import { retMessage, newMessage, chatModel } from "./message.model";
import { Observable } from "rxjs";
import { ChatSocket } from "../chat.socket";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class ChatService {
	constructor(
		private socket: ChatSocket,
		//ADD HTTP THINGY
		private readonly http: HttpClient
	) {}

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

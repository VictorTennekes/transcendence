import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { newMsg, retMessage } from "./message.model";
import { Observable } from "rxjs";
import { Socket } from "ngx-socket-io";

@Injectable()
export class ChatService {
	private url = 'api/chat/msg/';
	constructor(private http: HttpClient,
				private socket: Socket) {}

// constructor(private socket: Socket) {}

	sendChat(message: string) {
		this.socket.emit('chat', message);
	}

	receiveChat(): Observable<retMessage> {
		return this.socket.fromEvent('chat');
	}

	// getUsers() {
		// return this.socket.fromEvent('users');
	// }

	public send(msg: retMessage): Observable<retMessage> {
		console.log(msg.message);
		console.log(msg.time);
		this.socket.emit('chat', msg);
		return this.http.post<retMessage>(this.url, msg);
	}

	public getMessages(chatId: string): Observable<retMessage[]> {
		return this.http.get<retMessage[]>(this.url + chatId);
	}

	// public getMessages(chatId: string): Observable<retMessage[]> {
		// return this.http.get<retMessage[]>(this.url);
	// }
}


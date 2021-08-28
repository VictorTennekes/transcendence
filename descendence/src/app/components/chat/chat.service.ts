import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { chatModel, retMessage, userModel, createChatModel } from "./message.model";
import { Observable } from "rxjs";
import { Socket } from "ngx-socket-io";

@Injectable()
export class ChatService {
	private url = 'api/chat/msg/';
	constructor(private http: HttpClient,
				private socket: Socket) {}

	sendChat(message: string) {
		this.socket.emit('send_message', message);
	}

	receiveChat(): Observable<retMessage> {
		// return this.socket.fromEvent('chat');
		return this.socket.fromEvent('request_message');
	}

	send(msg: retMessage): Observable<retMessage> {
		console.log(msg.message);
		console.log(msg.time);
		this.socket.emit('chat', msg);
		return this.http.post<retMessage>(this.url, msg);
	}

	getMessages(chatId: string): Observable<retMessage[]> {
		return this.http.get<retMessage[]>(this.url + chatId);
	}

	//TODO: breaks when you log out and log back in with different user?
	getCurrentUser(): Observable<userModel> {
		return this.http.get<userModel>('user');
	}

	findUser(username: string): Observable<chatModel> {
		return this.http.get<chatModel>('api/chat/find/' + username);
	}

	createNewChat(newChat: createChatModel): Observable<chatModel> {
		return this.http.post<chatModel>('api/chat/new', newChat);
	}

}


import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { chatModel, createChatModel, retMessage } from "../chat-client/message.model";
import { Observable } from "rxjs";

@Injectable()
export class SearchService {
	private url = 'api/chat/';
	constructor(private http: HttpClient) {}

	getChat(newChat: createChatModel): Observable<chatModel> {
		return this.http.post<chatModel>(this.url + 'get', newChat);
	}

	getMessagesFromChat(chatId: string): Observable<retMessage[]> {
		return this.http.get<retMessage[]>(this.url + 'msg/' + chatId);
	}

	findChatById(chatId: string): Observable<chatModel> {
		return this.http.get<chatModel>(this.url + 'get-chat/' + chatId);
	}

	getChats(): Observable<chatModel[]> {
		return this.http.get<chatModel[]>(this.url);
	}

	createNewChat(chat: createChatModel): Observable<chatModel> {
		return this.http.post<chatModel>(this.url + 'new', chat);
	}

	findMatchingChats(searchBy: string): Observable<chatModel[]> {
		return this.http.get<chatModel[]>(this.url + 'find/' + searchBy);
	}

	validatePassword(pass: string, chatId: string): Observable<boolean> {
		let object = {
			pass,
			chatId
		}
		return this.http.post<boolean>(this.url + 'validate-pass', object);
	}

	canAccessChat(id: string): Observable<boolean> {
		return this.http.get<boolean>(this.url + 'can-access/' + id);
	}

	addUserToChat(id: string): Observable<chatModel> {
		const chat: chatModel = {
			id: id,
			name: "",
			visibility: "",
			admins: [],
			users: [],
			messages: []
		}
		return this.http.post<chatModel>(this.url + "add-user", chat);
	}
}
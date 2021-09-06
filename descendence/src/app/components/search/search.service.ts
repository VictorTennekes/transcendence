import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { chatModel, createChatModel, retMessage } from "../chat/message.model";
import { Observable } from "rxjs";

@Injectable()
export class SearchService {
	private url = 'api/chat/';
	constructor(private http: HttpClient) {}

	// findUser(username: string): Observable<chatModel> {
		// return this.http.get<chatModel>(this.url + 'find/' + username);
	// }

	getChat(newChat: createChatModel): Observable<chatModel> {
		return this.http.post<chatModel>(this.url + 'get', newChat);
	}

	getMessagesFromChat(chatId: string): Observable<retMessage[]> {
		return this.http.get<retMessage[]>(this.url + 'msg/' + chatId);
	}

	getChats(): Observable<chatModel[]> {
		return this.http.get<chatModel[]>(this.url);
	}

	createNewChat(chat: createChatModel): Observable<chatModel> {
		console.log("search serbice create new chat");
		console.log(chat);
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
		console.log(object);
		return this.http.post<boolean>(this.url + 'validate-pass', object);
	}
}
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { chatModel, createChatModel } from "../chat/message.model";
import { Observable } from "rxjs";

@Injectable()
export class SearchService {
	private url = 'api/chat/';
	constructor(private http: HttpClient) {}

	findUser(username: string): Observable<chatModel> {
		return this.http.get<chatModel>(this.url + 'find/' + username);
	}

	createNewChat(newChat: createChatModel): Observable<chatModel> {
		return this.http.post<chatModel>(this.url + 'new', newChat);
	}
}
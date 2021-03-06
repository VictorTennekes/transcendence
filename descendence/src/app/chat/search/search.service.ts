import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { chatModel, createChatModel, editChatModel, retMessage } from "../chat-client/message.model";
import { Observable, pipe } from "rxjs";
// import { updateUsers } from "../settings.component";

import {map, take} from 'rxjs/operators';

@Injectable()
export class SearchService {
	private url = 'api/chat/';
	constructor(private http: HttpClient) {}

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

	updateAdmins(data: editChatModel): Observable<any> {
		return this.http.post(this.url + "update-admins", data)
	}

	addBan(data: editChatModel): Observable<any> {
		return this.http.post(this.url + 'add-ban', data);
	}

	addMute(data: editChatModel): Observable<any> {
		return this.http.post(this.url + 'add-mute', data);
	}

	editVisibility(data: editChatModel): Observable<any> {
		return this.http.post(this.url + 'edit-visibility', data);
	}

	userIsAdmin(id: string): Observable<boolean> {
		return this.http.get<boolean>(this.url + 'user-is-admin/' + id);
	}
	
	userInChat(id: string): Observable<boolean> {
		return this.http.get<any>(this.url + 'user-in-chat/' + id);
	}

	isLoggedInUser(username: string): any {
		return this.http.get<boolean>(this.url + 'is-logged-in-user/' + username).subscribe((res) => {
		})
	}

	async leaveChat(id: string) {
		await this.http.post(this.url + 'leave-chat', {chatId: id}).toPromise();
	}

	userIsOwner(id: string): Observable<boolean> {
		return this.http.get<boolean>(this.url + 'user-is-owner/' + id);
	}

}
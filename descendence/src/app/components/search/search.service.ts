import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { chatModel, createChatModel, retMessage } from "../chat/message.model";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
// import { map}

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
		// console.log("find chat by id: ", chatId);
		return this.http.get<chatModel>(this.url + 'get-chat/' + chatId);
	}

	getChats(): Observable<chatModel[]> {
		return this.http.get<chatModel[]>(this.url);
	}

	createNewChat(chat: createChatModel): Observable<chatModel> {
		// console.log("search serbice create new chat");
		// console.log(chat);
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

	canAccessChat(id: string): Observable<boolean> {
	// async canAccessChat(id: string): Promise<object> {
		// return this.http.get<boolean>(this.url + 'can-access', id);
		console.log("can access caht search service");
		// let lol =  this.http.get<boolean>(this.url + 'can-access/' + id).pipe(map((res: any) => {
			// console.log("can access chat res: ")
			// console.log(res);
			// return res;
			// if (res.status === "success") {
			//   return true;
			// }
			// return false;
		// }));
		let lol = true;
		return this.http.get<boolean>(this.url + 'can-access/' + id);
		// return this.http.get('http://localhost:3000/api/chat/can-access/' + id);
		// console.log("lol");
		// console.log(lol);
		// return lol;
	}

	addUserToChat(id: string): Observable<chatModel> {
		console.log("passing id to backend");
		console.log(id);
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
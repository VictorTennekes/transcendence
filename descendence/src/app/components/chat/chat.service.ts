import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Message, retMessage } from "./message.model";
import { Observable } from "rxjs";

@Injectable()
export class ChatService {
    private url = 'api/chat';
    constructor(private http: HttpClient) {}

    public create(msg: Message): Observable<Message> {
        return this.http.post<Message>(this.url, msg);
    }

    public getMessages(): Observable<retMessage[]> {
        return this.http.get<retMessage[]>(this.url);
    }
}


import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { newMsg, retMessage } from "./message.model";
import { Observable } from "rxjs";

@Injectable()
export class ChatService {
    private url = 'api/chat/msg';
    constructor(private http: HttpClient) {}

    public create(msg: newMsg): Observable<retMessage> {
        console.log(msg.message);
        return this.http.post<retMessage>(this.url, msg);
    }

    public getMessages(): Observable<retMessage[]> {
        return this.http.get<retMessage[]>(this.url);
    }
}


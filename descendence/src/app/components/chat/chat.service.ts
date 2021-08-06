import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Message, retMessage } from "./message.model";
import { Observable } from "rxjs";

@Injectable()
export class ChatService {
    private baseUrl = 'http://localhost:3000/api/chat/send';
    private otherUrl = 'http://localhost:3000/api/chat/msg';
    constructor(private http: HttpClient) {}

    public create(msg: Message): Observable<Message> {
        console.log("making POST request?");
        console.log(msg.owner);
        console.log(msg.message);
        return this.http.post<Message>(this.baseUrl, msg);
    }

    public getMessages(): Observable<retMessage[]> {
        return this.http.get<retMessage[]>(this.otherUrl);
    }
}

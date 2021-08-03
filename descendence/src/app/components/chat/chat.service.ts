import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class ChatService {
    private baseUrl = 'api/chat';
    constructor(private http: HttpClient) {}

    // punlic create()
}

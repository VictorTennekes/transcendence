import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ChatComponent } from "../chat-client/chat.component";
import { ChatService } from "../chat-client/chat.service";
import { chatModel, createChatModel } from "../chat-client/message.model";
import { SearchService } from "./search.service";
import {HttpErrorResponse} from '@angular/common/http';
//TODO: display error when can't access chat
@Component({
	selector: 'chat-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	providers: [ChatComponent, SearchService, ChatService]
  })
  export class SearchComponent implements OnInit {

	constructor(private searchService: SearchService,
		private router: Router,
		private route: ActivatedRoute) {}

	// public userNotFound: boolean = false;
	// public chatNotFound: boolean = false;
	public chats: chatModel[] = [];
	public errorMessage: string = "";

	userForm = new FormGroup ({
		username: new FormControl('', {
		})
	})

	private getChats(): chatModel[] {
		this.route.params.subscribe(params => {
			console.log(params);
			this.errorMessage = params['error'];
		})
		this.searchService.getChats().subscribe(response => {
			this.chats = response;
			console.log(response);
			return response
		});
		return [];
	}

	ngOnInit(): void {
		this.getChats();
	}

	private redirectToChat(chat: chatModel) {
		this.router.navigate(['home', {outlets: {chat: ['get-chat', chat.id]}}]);
	}

	public getChat(chat: chatModel) {
		this.redirectToChat(chat);
	}

	public redirectCreate() {
		this.router.navigate(['home', {outlets: {chat: 'new-chat'}}], {skipLocationChange: true});
	}

	public submitUser() {
		//TODO: when searching for a dm, a dm is not created, but it finds chat's by the user
		const newChat: createChatModel = {
			name: '',
			users: [],
			admins: [],
			visibility: 'direct',
			password: ""
		}
		newChat.users.push(this.userForm.value.username);
		this.searchService.findMatchingChats(this.userForm.value.username).subscribe(
			(response: chatModel[]) => {
				// this.chatNotFound = false;
				this.errorMessage = "";
				this.chats = response;
				console.log("aaaa");
			},
			// (error: HttpErrorResponse) => {
			(error: HttpErrorResponse) => {
				console.log("in error")
				console.log(error)
				// this.chatNotFound = true
				// this.errorMessage = "Chat not found";
				this.errorMessage = error.error.message;
				this.chats = [];
			},
		)
	}
}

import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { ChatComponent } from "../chat-client/chat.component";
import { ChatService } from "../chat-client/chat.service";
import { chatModel, createChatModel } from "../chat-client/message.model";
import { SearchService } from "./search.service";

@Component({
	selector: 'chat-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	providers: [ChatComponent, SearchService, ChatService]
  })
  export class SearchComponent implements OnInit {

	constructor(private searchService: SearchService,
		private router: Router) {}

	public userNotFound: boolean = false;
	public chatNotFound: boolean = false;
	public chats: chatModel[] = [];


	userForm = new FormGroup ({
		username: new FormControl('', {
		})
	})

	private getChats(): chatModel[] {
		this.searchService.getChats().subscribe(response => {
			this.chats = response;
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
		const newChat: createChatModel = {
			name: '',
			users: [],
			admins: [],
			visibility: 'direct',
			password: ""
		}
		newChat.users.push(this.userForm.value.username);
		this.searchService.findMatchingChats(this.userForm.value.username).subscribe(
			(response) => {
				this.chatNotFound = false;
				this.chats = response;
			},
			(error) => {
				this.chatNotFound = true;
			}
		)
	}
}

import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { ChatComponent } from "../chat/chat.component";
import { ChatService } from "../chat/chat.service";
import { chatModel, createChatModel } from "../chat/message.model";
import { SearchService } from "./search.service";

@Component({
	selector: 'chat-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	providers: [ChatComponent, SearchService, ChatService]
  })
  export class SearchComponent implements OnInit {

	constructor(private searchService: SearchService,
		private router: Router,
		private chatService: ChatService) {}

	public userNotFound: boolean = false;
	public chatNotFound: boolean = false;
	public chats: chatModel[] = [];


	userForm = new FormGroup ({
		username: new FormControl('', {
		})
	})

	private getChats(): chatModel[] {
		this.searchService.getChats().subscribe(response => {
			console.log(response);
			this.chats = response;
			return response
		});
		return [];
	}

	ngOnInit(): void {
		// this.chats = this.getChats()
		this.getChats();
		console.log("chats");
		console.log(this.chats);
	}

	//TODO: display all options for chats
	//TODO: On select of chat, messages will get get fetched from the db

	private redirectToChat(chat: chatModel) {
		this.searchService.getMessagesFromChat(chat.id).subscribe((response) => {
			chat.messages = response.reverse();
			if (chat.visibility === 'protected') {
				this.router.navigateByUrl('/chat-pass', {state: chat});
			} else {
				this.router.navigateByUrl('/chat', {state: chat});
			}
		})
	}

	public getChat(chat: chatModel) {
		console.log("this chat is");
		console.log(chat);
		this.redirectToChat(chat);
	}

	public redirectCreate() {
		this.router.navigateByUrl('/new-chat');
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
				console.log("response");
				console.log(response);
				this.chatNotFound = false;
				this.chats = response;
			},
			(error) => {
				this.chatNotFound = true;
				console.log(error)
			}
		)
	// 	this.searchService.findUser(this.userForm.value.username).subscribe(
	// 		(response) => {
	// 			this.redirectToChat(response);
	// 		},
	// 		(error) => {
	// 			if (error.error.statusCode === 404) {
	// 				this.userNotFound = true;
	// 			} else {
	// 				this.searchService.getChat(newChat).subscribe(
	// 					(response) => {
	// 						this.redirectToChat(response);
	// 					},
	// 					(error) => console.log(error)
	// 				)
	// 			}
	// 		}
	// 	)
	}
}

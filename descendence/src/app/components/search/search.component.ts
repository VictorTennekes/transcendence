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

	userForm = new FormGroup ({
		username: new FormControl('', {
		})
	})

	ngOnInit(): void {
	}

	//TODO: display all options for chats
	//TODO: On select of chat, messages will get get fetched from the db
	public submitUser() {
		let chat: chatModel;
		const newChat: createChatModel = {
			name: '',
			user: this.userForm.value.username
		}
		this.searchService.findUser(this.userForm.value.username).subscribe(
			(response) => {
				chat = response;
				this.searchService.getMessagesFromChat(chat.id).subscribe((response) => {
					chat.messages = response.reverse();
					this.router.navigateByUrl('/chat', {state: chat} );
				})
			},
			(error) => {
				if (error.error.statusCode === 404) {
					this.userNotFound = true;
				} else {
					this.searchService.getChat(newChat).subscribe(
						(response) => {
							chat = response;
							chat.messages = [];
							this.router.navigateByUrl('/chat', {state: chat} );
						},
						(error) => console.log(error)
					)
				}
			}
		)
	}
}

import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ChatComponent } from "../chat/chat.component";
import { ChatService } from "../chat/chat.service";
import { createChatModel } from "../chat/message.model";

@Component({
	selector: 'chat-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	providers: [ChatComponent, ChatService]
  })
  export class SearchComponent implements OnInit {

	constructor(
		private chatService: ChatService,
		private http: HttpClient
	) {}

	public chatId: string = "";

	userForm = new FormGroup ({
		username: new FormControl('', {
		})
	})

	ngOnInit(): void {
	}

	public userNotFound: boolean = false;
	public submitUser() {
		const newChat: createChatModel = {
			name: '',
			user: this.userForm.value.username
		}
		this.chatService.findUser(this.userForm.value.username).subscribe(
			(response) => {
				this.chatId = response.id;
			},
			(error) => {
				if (error.error.statusCode === 404) {
					this.userNotFound = true;
					this.chatId = ""
				} else {
					this.chatService.createNewChat(newChat).subscribe(
						(response) => this.chatId = response.id,
						(error) => console.log(error)
					)
				}
			}
		)
	}
}

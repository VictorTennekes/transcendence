import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ChatComponent } from "../chat/chat.component";
import { chatModel, createChatModel } from "../chat/message.model";

@Component({
	selector: 'chat-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	providers: [ChatComponent]
  })
  export class SearchComponent implements OnInit {

	constructor(
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

		let findUser: string = 'api/chat/find/' + this.userForm.value.username;
		this.http.get<chatModel>(findUser).subscribe(
			(response) => {
				this.chatId = response.id;
			},
			(error) => {
				console.log(error);
				console.log(this.userForm.errors);
				if (error.error.statusCode === 404) {
					this.userNotFound = true;
					this.chatId = "";
				} else {
					this.http.post<chatModel>('api/chat/new', newChat).subscribe(
						(response) => this.chatId = response.id,
						(error) => console.log(error)
					);
				}
			}
		)
	}
}

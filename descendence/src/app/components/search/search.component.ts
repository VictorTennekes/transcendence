import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ChatComponent } from "../chat/chat.component";
import { createChatModel } from "../chat/message.model";
import { SearchService } from "./search.service";

@Component({
	selector: 'chat-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	providers: [ChatComponent, SearchService]
  })
  export class SearchComponent implements OnInit {

	constructor(private searchService: SearchService) {}

	public chatId: string = "";

	userForm = new FormGroup ({
		username: new FormControl('', {
		})
	})

	ngOnInit(): void {
	}

	public userNotFound: boolean = false;
	public submitUser() {
		//TODO: send ChatComponent a complete chatDTO object on redirect which will contain initial messages 
		const newChat: createChatModel = {
			name: '',
			user: this.userForm.value.username
		}
		this.searchService.findUser(this.userForm.value.username).subscribe(
			(response) => {
				this.chatId = response.id;
			},
			(error) => {
				if (error.error.statusCode === 404) {
					this.userNotFound = true;
					this.chatId = ""
				} else {
					this.searchService.createNewChat(newChat).subscribe(
						(response) => this.chatId = response.id,
						(error) => console.log(error)
					)
				}
			}
		)
	}
}

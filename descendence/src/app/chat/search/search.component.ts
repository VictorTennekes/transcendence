import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ChatComponent } from "../chat-client/chat.component";
import { ChatService } from "../chat-client/chat.service";
import { chatModel, createChatModel } from "../chat-client/message.model";
import { SearchService } from "./search.service";
import {HttpErrorResponse} from '@angular/common/http';
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

	public chats: chatModel[] = [];
	public errorMessage: string = "";

	userForm = new FormGroup ({
		username: new FormControl('', {
		})
	})

	private getChats(): chatModel[] {
		this.route.params.subscribe(params => {
			this.errorMessage = params['error'];
		})
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
		this.router.navigate(['', {outlets: {chat: ['get-chat', chat.id]}}]);
	}

	public getChat(chat: chatModel) {
		this.redirectToChat(chat);
	}

	public redirectCreate() {
		this.router.navigate(['', {outlets: {chat: 'new-chat'}}]);
	}

	public back() {
		this.getChats();
		this.userForm.reset();
	}

	public submitUser() {
		if (this.userForm.value.username) {
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
					this.errorMessage = "";
					this.chats = response;
				},
				(error: HttpErrorResponse) => {
					this.errorMessage = error.error.message;
					this.chats = [];
				},
			)
		}
	}

}

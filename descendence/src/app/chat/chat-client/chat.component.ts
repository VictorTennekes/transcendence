import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../search/search.service';
import { ChatService } from './chat.service';
import { retMessage, newMessage, chatModel } from './message.model';
//TODO: when entering a chat, add user to the chat (when public + no pw and user wasn't previously part of chat)
@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.scss'],
	providers: [ChatService, SearchService]
  })
  export class ChatComponent implements OnInit {

	constructor(
		  private formBuilder: FormBuilder,
		  private chatService: ChatService,
		  private searchService: SearchService,
		  private router: Router,
		  private route: ActivatedRoute,
	  ) { }

	public chat: chatModel = {
		id: "",
		name: "",
		users: [],
		admins: [],
		messages: [],
		visibility: ""
	};
	messageForm = this.formBuilder.group({
		message: "",
	});
	public default_avatar_url = "";
	public sendError: boolean = false;

	public userIsAdmin: boolean = false;
	ngOnInit(): void {
		
		this.chatService.listenForError().subscribe((error) => {
			console.log(error);
			//TODO: specify error when possinle
			this.sendError = true;
		})
		console.log(this.chat);
		this.route.params.subscribe(params => {
			this.searchService.findChatById(params['id']).subscribe((response) => {
				console.log("found chat by id");
				// console.log(response);
				this.chat = response;
				console.log(this.chat);
				this.searchService.userInChat(this.chat.id).subscribe((isTrue: boolean) => {
					if (isTrue === false) {
						this.searchService.addUserToChat(this.chat.id).subscribe((updatedChat: chatModel) => {
							this.chat.users = updatedChat.users;
						})
					}
				})
				this.searchService.userIsAdmin(this.chat.id).subscribe((result) => {
					this.userIsAdmin = result;
				});
				console.log("here?");
				this.chatService.receiveMessages().subscribe((msg) => {
						console.log("chat is");
						console.log(this.chat);
					if (msg.chat.id === this.chat.id) {
						this.chat.messages.push(msg);
						this.chat.messages.splice(0, this.chat.messages.length - 6);
					}
				})
			});
		});
	}

	public back() {
		this.router.navigate(['home', {outlets: {chat: 'search'}}], {skipLocationChange: true});
	}

	public edit() {
		if (this.userIsAdmin) {
			this.router.navigate(['/home', {outlets: {chat: ['settings', this.chat.id]}}])
		}
	}

	public onSubmit() {
		this.sendError = false;
		const newMessage: newMessage = {
			chat: this.chat.id,
			message: this.messageForm.controls['message'].value
		}
		this.chatService.sendMessage(newMessage);
		this.messageForm.reset();
	  }
  }
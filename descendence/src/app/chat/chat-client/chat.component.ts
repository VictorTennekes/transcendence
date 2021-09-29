import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewChecked, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../search/search.service';
import { ChatService } from './chat.service';
import { retMessage, newMessage, chatModel } from './message.model';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.scss'],
	providers: [ChatService, SearchService]
  })
  export class ChatComponent implements OnInit, AfterViewChecked {
	@ViewChild('scrollMe') private myScrollContainer!: ElementRef;

	scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) { }                 
    }

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

	ngOnInit(): void {
		this.chatService.listenForError().subscribe((error) => {
			console.log(error);
			this.sendError = true;
		})
		console.log(this.chat);
		this.route.params.subscribe(params => {
			this.searchService.findChatById(params['id']).subscribe((fullChat: chatModel) => {
				this.chat = fullChat;
				this.searchService.userInChat(this.chat.id).subscribe((isTrue: boolean) => {
					if (isTrue === false) {
						this.searchService.addUserToChat(this.chat.id).subscribe((updatedChat: chatModel) => {
							this.chat.users = updatedChat.users;
						})
					}
				})
				this.chatService.receiveMessages().subscribe((msg: retMessage) => {
					if (msg.chat.id === this.chat.id) {
						this.chat.messages.push(msg);
					}
					this.scrollToBottom();
				})
			});
		});
	}

	ngAfterViewChecked() : void {
		this.scrollToBottom();
	}

	public back() {
		this.router.navigate(['home', {outlets: {chat: 'search'}}], {skipLocationChange: true});
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
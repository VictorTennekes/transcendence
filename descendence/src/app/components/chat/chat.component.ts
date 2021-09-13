import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchService } from '../search/search.service';
import { ChatService } from './chat.service';
import { retMessage, newMessage, chatModel } from './message.model';

//TODO: protect this route

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.scss'],
	providers: [ChatService, SearchService]
  })
  export class ChatComponent implements OnInit {

	// private routeSubscription: Subscription;
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

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			// console.log(params) //log the entire params object
			// console.log("param id dud");
			// console.log(params['id']) //log the value of id
			this.searchService.findChatById(params['id']).subscribe((response) => {
				// console.log("found chat");
				// console.log(response);
				this.chat = response;
				this.chatService.receiveMessages().subscribe((msg) => {
					if (msg.chat.id === this.chat.id) {
						this.chat.messages.push(msg);
						this.chat.messages.splice(0, this.chat.messages.length - 6);
					}
				})
			});
		  });
		// this.chat = history.state;
		// this.searchService.getChat()
		// console.log(this.chat);
		// if (!this.chat.id) {
			// this.router.navigateByUrl('/search');
			// this.router.navigate(['home', {outlets: {chat: 'search'}}], {skipLocationChange: true});
		// }
		
	}

	public back() {
		// this.router.navigateByUrl('/search');
		this.router.navigate(['home', {outlets: {chat: 'search'}}], {skipLocationChange: true});
	}

	public onSubmit() {
		const newMessage: newMessage = {
			chat: this.chat.id,
			message: this.messageForm.controls['message'].value
		}
		this.chatService.sendMessage(newMessage);
		this.messageForm.reset();
	  }
  }
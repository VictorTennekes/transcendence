import { NodeWithI18n } from '@angular/compiler';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { newMsg, retMessage, userModel } from './message.model';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.scss'],
	providers: [ChatService]
  })
  export class ChatComponent implements OnInit {

	constructor(
		  private formBuilder: FormBuilder,
		  private chatService: ChatService,
		  private http: HttpClient
		//   private chatClientService: ChatClientService
	  ) { }

	@Input()
	chatId: string = "";


	displayComponent: boolean = false;
	messages: retMessage[] = [];
	user: any;
	messageForm = this.formBuilder.group({
		message: "",
	});

	// public msgArr: string[] = [];

	ngOnInit(): void {
		this.http.get('user').subscribe((response) => {
			console.log(response);
			this.user = response;
		})
		this.chatService.receiveChat().subscribe((msg) => {
			console.log("message from chat socket: ", msg);
			let item: retMessage = {
				chat: msg.chat,
				id: "",
				time: new Date(),
				owner: this.user,
				message: msg.message
			}
			this.messages.push(item);
			this.messages.splice(0, this.messages.length - 6);
			// this.msgArr.push(msg);
		})

		// this.chatService.getUsers().subscribe((users) => {
			// console.log("users method returns: ", users);
		// })
	}

	ngOnChanges() {
		// this.http.get('user').subscribe((response) => {
			// console.log(response);
			// this.user = response;
		// })
		if (this.chatId != "") {
			this.displayComponent = true;
			this.chatService.getMessages(this.chatId).subscribe(
				(response) => {
					this.messages = response;
					this.messages.splice(0, this.messages.length - 6)
				},
				(error) => console.log(error)
			);
		} else {
			this.displayComponent = false;
		}
	}

	public onSubmit() {
		
		// this.chatClientService.sendChat(this.messageForm.controls['message'].value);
		const pushThing: retMessage = {
			chat: this.chatId,
			id: "",
			time: new Date(),
			owner: this.user,
			message: this.messageForm.controls['message'].value
		}
		this.messages.push(pushThing);
		if (this.messages.length > 6) {
			this.messages.splice(0, this.messages.length - 6);
		}
		const msg: newMsg = {
			chat: this.chatId,
			message: this.messageForm.controls['message'].value
		}
		this.chatService.send(pushThing).subscribe(
			(response) => console.log(response),
			(error) => console.log(error)
		);
		this.messageForm.reset();
	  }
  }
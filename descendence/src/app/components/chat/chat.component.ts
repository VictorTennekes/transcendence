import { NodeWithI18n } from '@angular/compiler';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { newMsg, retMessage } from './message.model';

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
		//   private chatClientService: ChatClientService
	  ) { }

	@Input()
	chatId: string = "";

	displayComponent: boolean = false;
	messages: retMessage[] = [];
	messageForm = this.formBuilder.group({
		message: "",
	});

	// public msgArr: string[] = [];

	ngOnInit(): void {
		this.chatService.receiveChat().subscribe((msg) => {
			console.log("message from chat socket: ", msg);
			let item: retMessage = {
				chat: msg.chat,
				id: "",
				time: new Date(),
				owner: {
					intra_name: "websock",
					display_name: "websock"
				},
				message: msg.message
			}
			this.messages.push(item);
			// this.msgArr.push(msg);
		})

		// this.chatService.getUsers().subscribe((users) => {
			// console.log("users method returns: ", users);
		// })
	}

	ngOnChanges() {
		if (this.chatId != "") {
			this.displayComponent = true;
			this.chatService.getMessages(this.chatId).subscribe(
				(response) => this.messages = response,
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
			owner: {
				intra_name: "jsaariko",
				display_name: "jsaariko"
			},
			message: this.messageForm.controls['message'].value
		}
		this.messages.push(pushThing);
		const msg: newMsg = {
			chat: this.chatId,
			message: this.messageForm.controls['message'].value
		}
		this.chatService.send(msg).subscribe(
			(response) => console.log(response),
			(error) => console.log(error)
		);
		this.messageForm.reset();
	  }
  }
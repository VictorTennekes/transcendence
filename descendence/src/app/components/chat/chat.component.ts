import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ChatService } from './chat.service';
import { retMessage } from './message.model';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.scss'],
	providers: [ChatService]
  })
  export class ChatComponent implements OnInit {

	constructor(
		  private formBuilder: FormBuilder,
		  private chatService: ChatService
	  ) { }

	@Input()
	chatId: string = "";

	displayComponent: boolean = false;
	messages: retMessage[] = [];
	user: any;
	messageForm = this.formBuilder.group({
		message: "",
	});

	ngOnInit(): void {
		this.chatService.getCurrentUser().subscribe((user) => {
			this.user = user
		})
		this.chatService.receiveChat().subscribe((msg) => {
			this.messages.push(msg);
			this.messages.splice(0, this.messages.length - 6);
		})
	}

	ngOnChanges() {
		console.log("chat id on change: ", this.chatId);
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
		this.chatService.send(pushThing).subscribe(
			(response) => console.log(response),
			(error) => console.log(error)
		);
		this.chatService.sendChat(pushThing.message);
		this.messageForm.reset();
	  }
  }
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ChatService } from './chat.service';
import { retMessage, newMessage } from './message.model';

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
		this.chatService.receiveChat().subscribe((msg) => {
			this.messages.push(msg);
			this.messages.splice(0, this.messages.length - 6);
		})
		this.chatService.receiveMessages().subscribe((msg) => {
			console.log(msg);
			this.messages.push(msg);
			this.messages.splice(0, this.messages.length - 6);
			console.log('yay somebodys speaking to me!');
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
		const pushThing: newMessage = {
			chat: this.chatId,
			message: this.messageForm.controls['message'].value
		}
		this.chatService.sendChat(pushThing);
		this.messageForm.reset();
	  }
  }
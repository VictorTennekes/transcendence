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
		this.chatService.receiveMessages().subscribe((msg) => {
			console.log(msg);
			console.log(msg.chat.id, this.chatId);
			if (msg.chat.id === this.chatId) {
				this.messages.push(msg);
				this.messages.splice(0, this.messages.length - 6);
			}
			console.log('yay somebodys speaking to me!');
		})
	}

	ngOnChanges() {
		console.log("chat id on change: ", this.chatId);
		if (this.chatId != "") {
			this.displayComponent = true;
		} else {
			this.displayComponent = false;
		}
	}

	public onSubmit() {
		const newMessage: newMessage = {
			chat: this.chatId,
			message: this.messageForm.controls['message'].value
		}
		this.chatService.sendMessage(newMessage);
		this.messageForm.reset();
	  }
  }
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
		  private chatService: ChatService
	  ) { }
	@Input()
	chatId: string = "";

	displayComponent: boolean = false;
	messages: retMessage[] = [];
		messageForm = this.formBuilder.group({
		message: "",
	});

	ngOnInit(): void {
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
		const msg: newMsg = {
			chat: this.chatId,
			message: this.messageForm.controls['message'].value
		}
		this.chatService.create(msg).subscribe(
			(response) => console.log(response),
			(error) => console.log(error)
		);
		this.messageForm.reset();
	  }
  }
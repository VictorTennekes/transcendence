import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';
import { retMessage, newMessage, chatModel } from './message.model';

//TODO: protect this route

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

	public chat: chatModel;
	messageForm = this.formBuilder.group({
		message: "",
	});

	ngOnInit(): void {
		this.chat = history.state;
		this.chatService.receiveMessages().subscribe((msg) => {
			if (msg.chat.id === this.chat.id) {
				this.chat.messages.push(msg);
				this.chat.messages.splice(0, this.chat.messages.length - 6);
			}
		})
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
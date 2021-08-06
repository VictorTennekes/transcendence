import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DoAction } from './action';
import { ChatService } from './chat.service';
import { Message, retMessage } from './message.model';

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
    messages: retMessage[] = []
    messageForm = this.formBuilder.group({
        message: "",
    });
    @Output() public action: EventEmitter<DoAction> = new EventEmitter();

    ngOnInit(): void {
        this.chatService.getMessages().subscribe(
            (response) => this.messages = response,
            (error) => console.log(error)
        );
    }

  public onSubmit() {
      console.log("submitting");
      console.log(this.messageForm);
      console.log(this.messageForm.controls['message'].value)
      const msg: Message = {
          owner: "jsaariko",
          message: this.messageForm.controls['message'].value
      }
      this.chatService.create(msg).subscribe(
        (response) => console.log(response),
        (error) => console.log(error)
      );
      this.messageForm.reset();
    }
}

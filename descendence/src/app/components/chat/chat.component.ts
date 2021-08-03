import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DoAction } from './action';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

    constructor(
        private formBuilder: FormBuilder
    ) { }
    messageForm = this.formBuilder.group({
        message: "",
    });
    @Output() public action: EventEmitter<DoAction> = new EventEmitter();

  ngOnInit(): void {
  }
  public onSubmit() {
      console.log("submitting");
      console.log(this.messageForm);
      this.action.emit({
          type: 'send-message',
        payload: this.messageForm
      });
      this.messageForm.reset();
    }

}

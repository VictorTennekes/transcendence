import { HttpClient } from "@angular/common/http";
import { Component, ComponentFactory, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ChatComponent } from "../chat/chat.component";
import { chatModel, createChatModel } from "../chat/message.model";

@Component({
    selector: 'chat-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    providers: [ChatComponent]
  })
  export class SearchComponent implements OnInit {

    constructor(
        private formBuilder: FormBuilder,
        private http: HttpClient
        ) {}

    public chatId: string = "";

    userForm = this.formBuilder.group({
        userName: ""
    })

    ngOnInit(): void {

    }

    public submitUser() {
        const newChat: createChatModel = {
            name: '',
            user: this.userForm.controls['userName'].value
        }
        let findUser: string = 'api/chat/find/' + this.userForm.controls['userName'].value;
        this.http.get<chatModel>(findUser).subscribe(
            (response) => this.chatId = response.id,
            (error) => {
                console.log(error);
                if (error.error.statusCode === 404) {
                    console.log("user not found");
                } else {
                    this.http.post<chatModel>('api/chat/new', newChat).subscribe(
                        (response) => this.chatId = response.id,
                        (error) => console.log(error)
                    );
                }
            }
        )
    }
}

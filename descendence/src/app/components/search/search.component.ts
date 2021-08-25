import { HttpClient, HttpRequest, HttpResponse } from "@angular/common/http";
import { Component, ComponentFactory, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators, FormGroupDirective, NgForm, AbstractControl, AsyncValidatorFn, ControlContainer, ValidationErrors } from "@angular/forms";
import { ChatComponent } from "../chat/chat.component";
import { chatModel, createChatModel } from "../chat/message.model";
import { ErrorStateMatcher } from "@angular/material/core";
import { ConstantPool } from "@angular/compiler";
import { getMatInputUnsupportedTypeError } from "@angular/material/input";
import { Observable, of } from "rxjs";
import { debounceTime, map } from "rxjs/operators";
import { ValidatorFn } from "@angular/forms";
import { nullSafeIsEquivalent } from "@angular/compiler/src/output/output_ast";


@Component({
    selector: 'chat-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    providers: [ChatComponent]
  })
  export class SearchComponent implements OnInit {

    constructor(
        private http: HttpClient
	) {}

    public chatId: string = "";

	userForm = new FormGroup ({
		username: new FormControl('', {
		})
	})

    ngOnInit(): void {
	}

	public userNotFound: boolean = false;
    public submitUser() {
        const newChat: createChatModel = {
            name: '',
            user: this.userForm.value.username
        }

        let findUser: string = 'api/chat/find/' + this.userForm.value.username;
        this.http.get<chatModel>(findUser).subscribe(
            (response) => {
                this.chatId = response.id;
                console.log("found existing chat");
            },
            (error) => {
                console.log(error);
				console.log(this.userForm.errors);
                if (error.error.statusCode === 404) {
					this.userNotFound = true;
					this.chatId = "";
					console.log("user not found");
                } else {
                    console.log("creating new chat");
                    this.http.post<chatModel>('api/chat/new', newChat).subscribe(
                        (response) => this.chatId = response.id,
                        (error) => console.log(error)
                    );
                }
            }
        )
    }
}

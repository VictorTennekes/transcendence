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

	// userForm = new FormGroup ({
	// 	username: new FormControl('', [
	// 		Validators.required,
	// 		this.userValidator
	// 	]),
	// }, {updateOn: "submit"})



	validateAsync(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
	// validateAsync(control: AbstractControl): Observable<ValidationErrors> {

		// let http: HttpClient

		// let val: boolean = false;
		// this.http.get('api/chat/find/' + control.value).subscribe(
			// (response) => null,
			// (error) => of({'invalid': true}),
		// );
		// console.log('here');
		// if (control.touched) {
			console.log('after');
			console.log(control.value);
			// return this.http.get('api/chat/find/' + control.value).pipe(
			// (response) => {
			// 	console.log('response');
			// 	console.log(response);
			// 	return of({'invalid': true});
			// },
			// (error) => {
			// 	console.log("error");
			// 	console.log(error);
			// 	return of(null);

			// })


			// return this.http.get('api/chat/find/' + control.value).pipe(
			// map((response: any) => {
				// console.log(response.headers.keys());
				// console.log(response.body);
				// console.log('response');
				// console.log(response);
				// return of({'invalid': true});
			// }))






			// return this.http.get('api/chat/find/' + control.value, {observe: 'response'})
			// .pipe(map(res => {
			// 		if (res instanceof HttpResponse && res.ok) {
			// 			console.log("loll");
			// 			return of(null);
			// 		} else {
			// 			console.log("loll");
			// 			return of({'invalid': true});
			// 		}
			// 	}
			// ));
			if (control.value === "lol") {
				return of({'invalid': true});
			} else {
				return of(null);
			}

			// console.log("here");
			// return of(null);

			// map(response => {
				// console.log("hi");
				// console.log(response.valueOf());
				// return null;
			// })
		// }
		// return of(null);
	}

		// return this.http.get('/api/chat/find/' + control.value)
		// .pipe(
		// 	debounceTime(500),
		//   map( (data:any) =>  {
		// 	  if (!data.isValid) return ({ 'InValid': true })
		// 	//   else return null
		//   })
		// )
	// }


	
	userForm = new FormGroup ({
		username: new FormControl('', {
			asyncValidators: [this.validateAsync.bind(this)]
		})
	}, {updateOn: "submit"})


    ngOnInit(): void {

	}

	public userNotFound: boolean = false;
    public submitUser() {
		// console.log("form value: ", this.userForm.value.username);
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
					this.userForm.markAsTouched();
					this.userNotFound = true;
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

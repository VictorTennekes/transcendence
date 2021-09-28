import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ChatComponent } from "../chat-client/chat.component";
import { ChatService } from "../chat-client/chat.service";
import { chatModel, createChatModel } from "../chat-client/message.model";
import { SearchService } from "./search.service";
import {HttpErrorResponse} from '@angular/common/http';
// import {catchError} from 'rxjs/operators';
import { Observable, of } from 'rxjs';
// import { map } from 'rxjs/operators';

import { catchError, map } from "rxjs/operators";
// import 'rxjs/add/observable/throw';
// import 'rxjs/Rx';




@Component({
	selector: 'chat-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	providers: [ChatComponent, SearchService, ChatService]
  })
  export class SearchComponent implements OnInit {

	constructor(private searchService: SearchService,
		private router: Router,
		private route: ActivatedRoute) {}

	public chats: chatModel[] = [];
	public errorMessage: string = "";

	userForm = new FormGroup ({
		username: new FormControl('', {
		})
	})

	private getChats() {
		this.route.params.subscribe(params => {
			this.errorMessage = params['error'];
		})
		this.searchService.getChats().subscribe(response => {
			this.chats = response;
		},
		(error) => {
			this.errorMessage = error.error.message;
		});
	}

	ngOnInit(): void {
		this.getChats();
	}

	private redirectToChat(chat: chatModel) {
		this.router.navigate(['home', {outlets: {chat: ['get-chat', chat.id]}}]);
	}

	public getChat(chat: chatModel) {
		this.redirectToChat(chat);
	}

	public redirectCreate() {
		this.router.navigate(['home', {outlets: {chat: 'new-chat'}}], {skipLocationChange: true});
	}

	public back() {
		this.getChats();
		this.userForm.reset();
	}

	public submitUser() {
		const newChat: createChatModel = {
			name: '',
			users: [],
			admins: [],
			visibility: 'direct',
			password: ""
		}
		newChat.users.push(this.userForm.value.username);
		console.log("whyyyy");
		let lol = this.searchService.findMatchingChats(this.userForm.value.username)
		// .pipe(
			// catchError( (err: any, caught: Observable<any>) => {

				// console.log('Handling error locally and rethrowing it...', err);

				// this.errorMessage = err.error.message;
				// return;
				// console.log(err);

				// return Observable.throw(err);




			// })
		// )


		// .pipe(map((response: chatModel[]) => {
		// 	console.log("got response:")
		// 	console.log(response);
		// 	this.chats = response;
		// 	return (response);
		// }),
		// catchError((e: any, caught: Observable<any>) => {
		// 	console.log("caught error");
		// 	console.log(e);
		// 	return Observable.throw(this.errorHandler(e))
		// }));

		// if (typeof lol === Observable) {
		// 	console.log("error has happeneds");
		// } else {
		// 	this.chats = lol;
		// }

		
		.subscribe(
			(response: chatModel[]) => {
				this.errorMessage = "";
				this.chats = response;
			},
			(error: HttpErrorResponse) => {
				console.log("um?");
				console.log(error);
				this.errorMessage = error.error.message;
				this.chats = [];
			},
		)
	}
	errorHandler(error: any): void {
		console.log("caught error")
		console.log(error)
	}
}

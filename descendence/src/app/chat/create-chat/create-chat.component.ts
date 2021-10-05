import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchService } from '../search/search.service';
import { createChatModel } from '../chat-client/message.model';
import * as bcrypt from 'bcryptjs';

@Component({
  	selector: 'app-create-chat',
  	templateUrl: './create-chat.component.html',
  	styleUrls: ['./create-chat.component.scss'],
	providers: [SearchService]
})
export class CreateChatComponent implements OnInit {
	hide = true;
	submitted: boolean = false;
	show: boolean = false;
	errorMessage: string = "";
  
	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private searchService: SearchService) { }

	createChatForm = this.formBuilder.group({
		name: new FormControl('', [Validators.required]),
		users: this.formBuilder.array([]),
		visibility: new FormControl('public'),
		password: new FormControl('')
	});

	ngOnInit(): void {
		this.createChatForm.get('visibility')?.valueChanges.subscribe((value) => {
			if (value === 'protected') {
				this.createChatForm.get('password')?.setValidators(Validators.required);
			} else {
				this.createChatForm.get('password')?.clearValidators();
			}
			this.createChatForm.get('password')?.updateValueAndValidity();

		})
	}

	users(): FormArray {
		return this.createChatForm.get("users") as FormArray
	}

	newUser(): FormGroup {
		return this.formBuilder.group({
			username: ""
		})
	}

	addUser() {
		this.users().push(this.newUser());
	}

	removeUser(i: number) {
		this.users().removeAt(i);
	}

	get public() {
		return this.createChatForm.get('public');
	}

	public back() {
		this.router.navigate(['', {outlets: {chat: ['search', ""]}}]);
	}

	public isProtected(): boolean {
		if (this.createChatForm.controls['visibility'].value === 'protected') {
			return true;
		}
		return false
	}

	public encryptPassword(value: string): string {
		const hashedPass = bcrypt.hashSync(value, bcrypt.genSaltSync());
		return hashedPass;
	}

	public getErrorMessage() {
		return "form Invalid";
	}

	public submitCreateChatForm() {
		this.submitted = true;
		let pw = "";
		if (this.createChatForm.controls['visibility'].value === 'protected') {
			pw = this.encryptPassword(this.createChatForm.controls['password'].value);
		}
		let newChat: createChatModel;
		if (this.createChatForm.valid) {
			newChat = {
				name: this.createChatForm.controls['name'].value.replace(/(\r\n|\n|\r)/gm, ""),
				visibility: this.createChatForm.controls['visibility'].value,
				password: pw,
				users: [],
				admins: []
			}
			for (let item of this.createChatForm.controls['users'].value) {
				newChat.users.push(item.username);
			}
			this.searchService.createNewChat(newChat).subscribe((response) => {
				this.router.navigate(['', {outlets: {chat: ['get-chat', response.id]}}], {state: response});
			},
			(error) => {
				this.submitted = false;
				this.errorMessage = error.error.message;
			})
		} else {
			console.log('invalid');
		}
	}

	public togglePassword() {
		this.show = !this.show;
	}
}

import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchService } from '../components/search/search.service';
import { createChatModel } from '../components/chat/message.model';
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
			console.log("visibility:", value);
			if (value === 'protected') {
				this.createChatForm.get('password')?.setValidators(Validators.required);
			} else {
				console.log("clearing validators?");
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
	  this.router.navigateByUrl('/search');
	}

	public isProtected(): boolean {
		if (this.createChatForm.controls['visibility'].value === 'protected') {
			return true;
		}
		return false
	}

	public encryptPassword(value: string): string {
		console.log(value)
		const hashedPass = bcrypt.hashSync(value, bcrypt.genSaltSync());
		return hashedPass;
	}

	public getErrorMessage() {
		return "form Invalid";
	}

	public otherSubmit() {
		this.submitted = true;
		console.log(this.createChatForm.value);
		let pw = "";
		if (this.createChatForm.controls['visibility'].value === 'protected') {
			pw = this.encryptPassword(this.createChatForm.controls['password'].value);
		}
		console.log("pass:");
		console.log(pw);
		let newChat: createChatModel
		if (this.createChatForm.valid) {
			newChat = {
				name: this.createChatForm.controls['name'].value,
				visibility: this.createChatForm.controls['visibility'].value,
				password: pw,
				users: [],
				admins: []
			}
			for (let item of this.createChatForm.controls['users'].value) {
				newChat.users.push(item.username);
			}
			console.log("users");
			console.log(newChat.users);

			this.searchService.createNewChat(newChat).subscribe((response) => {
				console.log("should be routing?");
				this.router.navigateByUrl('/chat', {state: response});
			},
			(error) => {
				console.log("error");
				console.log(error);
			})
		} else {
			console.log('invalid');
		}
	}

}

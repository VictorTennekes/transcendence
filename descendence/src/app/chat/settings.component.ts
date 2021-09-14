import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from './search/search.service';
import { Validators } from '@angular/forms';
import { chatModel, createChatModel, editChatModel } from './chat-client/message.model';
import { chatGuardService } from './chat-client/chatGuard.service';
import * as bcrypt from 'bcryptjs';

// export interface updateUsers {
	// chatId: string;
	// users: string[];
// }

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [SearchService]
})
export class SettingsComponent implements OnInit {
	hide = true;
	submitted: boolean = false;
	constructor(private router: Router,
				private route: ActivatedRoute,
				private formBuilder: FormBuilder,
				private searchService: SearchService) { }

	// chatId: string = "";
	chat: chatModel = {
		id: "",
		name: "",
		users: [],
		admins: [],
		messages: [],
		visibility: ""
	}

	addAdminForm = this.formBuilder.group({
		username: new FormControl('')
	})

	editVisibilityForm = this.formBuilder.group({
		visibility: new FormControl(''),
		password: new FormControl('')
	})

	addMuteForm = this.formBuilder.group({
		username: new FormControl(''),
		time: new FormControl('')
	})
	addBanForm = this.formBuilder.group({
		username: new FormControl(''),
		time: new FormControl('')
	})

	ngOnInit(): void {
		this.route.params.subscribe((params) => {
			this.searchService.findChatById(params['id']).subscribe((result) => {
				this.chat = result;
			});
		})
		this.editVisibilityForm.get('visibility')?.valueChanges.subscribe((value) => {
			if (value === 'protected') {
				this.editVisibilityForm.get('password')?.setValidators(Validators.required);
			} else {
				this.editVisibilityForm.get('password')?.clearValidators();
			}
			this.editVisibilityForm.get('password')?.updateValueAndValidity();

		})
	}

	public originallyPrivate(): boolean {
		if (this.chat.visibility == "private") {
			return true;
		}
		return false;
	}

	public originallyPublic(): boolean {
		if (this.chat.visibility == "public") {
			return true;
		}
		return false;
	}

	public originallyProtected(): boolean {
		if (this.chat.visibility == "protected") {
			return true;
		}
		return false;
	}

	public back() {
		this.router.navigate(['home', {outlets: {chat: ["get-chat", this.chat.id]}}], {skipLocationChange: true});
	}

	public isProtected(): boolean {
		if (this.editVisibilityForm.controls['visibility'].value === 'protected') {
			return true;
		}
		return false
	}

	public encryptPassword(value: string): string {
		return bcrypt.hashSync(value, bcrypt.genSaltSync());
	}


	public submitAdmin() {
		let data: editChatModel = {
			id: this.chat.id,
			admin: "",
			mutedUser: "",
			mutedTime: "",
			bannedUser: "",
			bannedTime: "",
			visibility: "",
			password: ""
		}

	}


	public submitVisibility() {
		let data: editChatModel = {
			id: this.chat.id,
			admin: "",
			mutedUser: "",
			mutedTime: "",
			bannedUser: "",
			bannedTime: "",
			visibility: "",
			password: ""
		}
	}

	public submitMute() {
		let data: editChatModel = {
			id: this.chat.id,
			admin: "",
			mutedUser: "",
			mutedTime: "",
			bannedUser: "",
			bannedTime: "",
			visibility: "",
			password: ""
		}
		console.log(this.addMuteForm.value);
	}

	public submitBan() {

	}
	// public submit() {
	// 	console.log(this.editChatForm.value);
	// 	// let data: updateUsers = {
	// 		// chatId: this.chat.id,
	// 		// users: []
	// 	// }
	// 	let data: editChatModel = {
	// 		id: this.chat.id,
	// 		admins: [],
	// 		mutes: [],
	// 		bans: [],
	// 		visibility: "",
	// 		password: ""
	// 	}

	// 	if (this.editChatForm.controls['visibility'].value == 'protected' && this.editChatForm.controls['password']) {
	// 		data.visibility = 'protected';
	// 		data.password = this.encryptPassword(this.editChatForm.controls['password'].value);
	// 	} else if (this.editChatForm.controls['visibility'].value != this.chat.visibility) {
	// 		data.visibility = this.editChatForm.controls['visibility'].value;
	// 	}

	// 	for (let item of this.editChatForm.controls['admins'].value) {
	// 		data.admins.push(item.username);
	// 	}

	// 	// for (let item of this.editChatForm.controls['admins'].value) {
	// 		// data.admins.push(item.username);
	// 	// }


	// 	// this.searchService.updateAdmins(this.chatId, this.editChatForm.controls['admins'].value);
	// 	// this.searchService.updateAdmins(data).subscribe((reply) => {
	// 		// console.log(reply)
	// 	// })
	// 	this.searchService.updateChat(data).subscribe((reply) => {
	// 		console.log(reply)
	// 	})


	// 	// this.chat.visibility = this.editChatForm.controls['visibility'].value;
	// 	// let lol: createChatModel = {

	// 	// }
	// 	// this.searchService.updateVisibility()
	// }
  
}

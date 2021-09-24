import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../search/search.service';
import { Validators } from '@angular/forms';
import { chatModel, editChatModel } from '../chat-client/message.model';
import * as bcrypt from 'bcryptjs';

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
		// this.editVisibilityForm.setValue({visibility: this.chat.visibility});
		this.editVisibilityForm.controls['visibility'].setValue({visibility: this.chat.visibility});
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
		if (['private', 'public', 'protected'].includes(this.editVisibilityForm.controls['visibility'].value)) {
			if (this.editVisibilityForm.controls['visibility'].value === 'protected') {
				return true;
			}
			return false
		}
		if (this.chat.visibility === 'protected') {
			return true;
		}
		return false
	}

	public encryptPassword(value: string): string {
		console.log("encrypting", value);
		if (value) {
			return bcrypt.hashSync(value, bcrypt.genSaltSync());
		}
		throw "oops";
	}


	public submitAdmin() {
		let data: editChatModel = {
			id: this.chat.id,
			admin: this.addAdminForm.controls['username'].value,
			bannedUser: "",
			bannedTime: new Date,
			banType: "",
			visibility: "",
			password: ""
		}
		this.searchService.updateAdmins(data).subscribe((result) => {
			console.log(result);
		})
		this.addAdminForm.reset();
	}


	public submitVisibility() {
		console.log(this.editVisibilityForm.value);
		console.log(this.editVisibilityForm.controls['password'].value);
		try {
			let data: editChatModel = {
				id: this.chat.id,
				admin: "",
				bannedUser: "",
				bannedTime: new Date,
				banType: '',
				visibility: this.editVisibilityForm.controls['visibility'].value,
				password: this.encryptPassword(this.editVisibilityForm.controls['password'].value)
			}
			console.log(data);
			this.searchService.editVisibility(data).subscribe((result) => {
				console.log(result);
			})
			this.editVisibilityForm.controls['password'].reset();
		} catch (error) {
			console.log(error);
		}
	}

	public submitMute() {
		let data: editChatModel = {
			id: this.chat.id,
			admin: "",
			bannedUser: this.addMuteForm.controls['username'].value,
			bannedTime: new Date(this.addMuteForm.controls['time'].value),
			banType: 'mute',
			visibility: "",
			password: ""
		}
		console.log(this.addMuteForm.value);
		this.searchService.addMute(data).subscribe((result) => {
			console.log(result);
		})
		this.addMuteForm.reset();
	}

	public submitBan() {
		let data: editChatModel = {
			id: this.chat.id,
			admin: "",
			bannedUser: this.addBanForm.controls['username'].value,
			bannedTime: new Date(this.addBanForm.controls['time'].value),
			banType: 'ban',
			visibility: "",
			password: ""
		}
		console.log("adding ban for:");
		console.log(data);
		console.log(typeof data.bannedTime);
		console.log("is data object?")
		console.log(typeof data.bannedTime.getTime === 'function');
		this.searchService.addBan(data).subscribe((result) => {
			console.log(result);
		})

		this.addBanForm.reset();
	}
}

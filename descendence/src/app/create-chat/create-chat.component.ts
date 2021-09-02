import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-chat',
  templateUrl: './create-chat.component.html',
  styleUrls: ['./create-chat.component.scss']
})
export class CreateChatComponent implements OnInit {


  constructor(
	  private formBuilder: FormBuilder,
	  private router: Router) { }

	createChatForm = this.formBuilder.group({
		name: new FormControl('', [Validators.required]),
		users: this.formBuilder.array([]),
		// users: [this.SubjectsArray],
		visibility: new FormControl('public', [Validators.required])
	});

	ngOnInit(): void {
	}

	users(): FormArray {
		return this.createChatForm.get("users") as FormArray
	}

	newUser(): FormGroup {
		return this.formBuilder.group({
			// name: new FormControl('', [Validators.required])
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

	public otherSubmit() {
		console.log(this.createChatForm.value);

	}

}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
	
	loginForm: FormGroup;
	submitted: Boolean = false;
	error: string = '';
	returnUrl: string = '';

	constructor(
		private formBuilder: FormBuilder,
		private http: HttpClient,
		private route: ActivatedRoute,
		private router: Router
	) { }

	ngOnInit(): void {
		this.loginForm = this.formBuilder.group({
			username: ['login', Validators.required]
		});
	}

	get form() {
		return this.loginForm.controls;
	}

	submit()
	{
		this.submitted = true;
		const login = this.loginForm.controls.username.value;
		console.log(`Login = ${login}`);
		document.location.href = "api/auth/redirect";
	}
}

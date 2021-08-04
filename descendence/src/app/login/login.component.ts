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
		this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/'; 
	}

	get form() {
		return this.loginForm.controls;
	}

	submit()
	{
		this.submitted = true;
		const login = this.form.username.value;
		console.log(`Login = ${login}`);
		this.http.post("api/user/login", { intra_name: login }).pipe(first()).subscribe((data) => {
			this.error = '';
			this.router.navigate([this.returnUrl]);
		}, (error) => {
			this.error = error;
		});
	}
}

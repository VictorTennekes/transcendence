import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
	selector: 'app-two-factor',
	templateUrl: './two-factor.component.html',
	styleUrls: ['./two-factor.component.scss']
})
export class TwoFactorComponent implements OnInit, AfterViewInit {
	codeForm;
	constructor(
		private readonly authService: AuthService,
		private readonly router: Router
	) {
		this.codeForm = new FormGroup({
			code1: new FormControl(''),
			code2: new FormControl(''),
			code3: new FormControl(''),
			code4: new FormControl(''),
			code5: new FormControl(''),
			code6: new FormControl(''),
		});
	}
	
	ngOnInit(): void {
	}
	
	ngAfterViewInit() {
		const inputs = document.querySelectorAll<HTMLInputElement>('#code-container > *[id]');
		inputs[0].focus();
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].addEventListener('keydown', function(event: any) {
				if (event.key === "Backspace") {
					
					if (inputs[i]?.value == '') {
						if (i != 0) {
							inputs[i - 1].focus();
						}
					} else {
						inputs[i].value = '';
					}
				}
				// } else if (event.key == "Enter" && i + 1 === inputs.length) {
				// 	document.getElementById("submit-button")?.click();
				// }
				else if (event.key === "ArrowLeft" && i !== 0) {
					inputs[i - 1].focus();
				} else if (event.key === "ArrowRight" && i !== inputs.length - 1) {
					inputs[i + 1].focus();
				} else if (event.key != "ArrowLeft" && event.key != "ArrowRight" && event.key != "Enter") {
					inputs[i].value = ''; // Bug Fix: allow user to change a random otp digit after pressing it
				}
			});
			inputs[i].addEventListener('input', (event) => {
				if (!inputs[i].value.search('[^0-9]')) {
					inputs[i].value = '';
					event.preventDefault();
					return false;
				}
				if (i === inputs.length - 1 && inputs[i].value !== '') {
					return true;
				} else if (inputs[i].value !== '') {
					inputs[i + 1].focus();
					return false;
				}
				return false;
			});
		}
	}
	clearField() {
		const inputs = document.querySelectorAll<HTMLInputElement>('#code-container > *[id]');
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value = '';
		}
		inputs[0].focus();
	}

	sendCode() {
		const inputFields = this.codeForm.controls;
		let code = "";
		for (let field in inputFields) {
			console.log(`INPUTFIELD[${field}] = ${inputFields[field].value}`);
			if (inputFields[field].value === '') {
				return ;
			}
			code += inputFields[field].value;
		}
		console.log(code);
		this.authService.authenticate(code).subscribe((result: any) => {
			this.router.navigateByUrl('/');
			console.log("succes");
		},
		(err) => {
			console.log("CODE IS NOT VALID");
			this.clearField();
		})
	}
}

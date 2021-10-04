import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { FocusOverlayService } from './focus-overlay.service';
import { SharedValidatorService } from './shared-validator.service';

const otp_length = 6;

@Component({
	selector: 'app-focus-overlay',
	templateUrl: './focus-overlay.component.html',
	styleUrls: ['./focus-overlay.component.scss']
})
export class FocusOverlayComponent implements OnInit, AfterViewInit {
	
	qrcode: any;
	codeForm: FormGroup;
	constructor(
		private readonly authService: AuthService,
		private valid: SharedValidatorService,
		private service: FocusOverlayService
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

	setWrong(state: boolean) {
		const inputs = document.querySelectorAll<HTMLInputElement>('#code-container > *[id]');
		for (let i = 0; i < inputs.length; i++) {
			if (inputs[i].classList.contains('wrong') && state == false) {
				inputs[i].classList.remove('wrong');
			}
			else if (!inputs[i].classList.contains('wrong') && state == true) {
				inputs[i].classList.add('wrong');
			}
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
				break ;
			}
			code += inputFields[field].value;
		}
		if (code.length != otp_length) {
			this.clearField();
			return ;
		}
		console.log(code);
		this.authService.validateQRCode(code).subscribe((result: any) => {
			console.log("succes");
			this.valid.valid = true;
			this.service.close();
			this.setWrong(false);
		},
		(err) => {
			console.log("CODE IS NOT VALID");
			this.clearField();
			this.setWrong(true);
		})
	}

	async ngOnInit() {
		(await this.authService.getQRCode()).subscribe((code) => {
			console.log(`QRCODE: ${code}`);
			this.qrcode = code;
		})
	}
}

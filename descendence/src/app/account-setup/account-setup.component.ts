import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import { UserService } from '../user.service';



@Component({
  selector: 'app-account-setup',
  templateUrl: './account-setup.component.html',
  styleUrls: ['./account-setup.component.scss']
})
export class AccountSetupComponent implements OnInit {

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) { }

  login: string;
  form: FormGroup;

    get buttonEnabled() {
      return this.form.controls['name'].valid;
    }

  submitForm() {
		let formValues: {[key: string]: any} = {};
		for (const field in this.form.controls) {
			formValues[field] = this.form.controls[field].value;
		}
		if (formValues['name'] && this.form.controls['name'].valid) {
			this.userService.updateDisplayName(formValues['name']).subscribe(() => {
        this.router.navigate(['']);
      });
		}
  }

  displayNameIsValid(str: string) : boolean {
		var code, i, len;

    len = str.length;
    if (len < 5 || len > 24)
      return false;
		for (i = 0; i < len; i++) {
			code = str.charCodeAt(i);
			if (!(code > 47 && code < 58) && // numeric (0-9)
				!(code > 64 && code < 91) && // upper alpha (A-Z)
				!(code > 96 && code < 123)) { // lower alpha (a-z)
				return false;
			}
		}
		return true;
	}

	displayNameIsUnique(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			let err: ValidationErrors = {
				'notUnique': false,
				'notValid': false
			}
			return of(control.value).pipe(delay(500),switchMap(() => {
				return this.userService.checkDisplayNameAvailability(control.value).pipe(map((available) => {
					if (!this.displayNameIsValid(control.value)) {
						err['notValid'] = true;
						return err;
					}
					if (!available) {
						err['notUnique'] = true;
						return err;
					}
					return null;
				}));
			}));
		}
	}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe((user: any) => {
      this.login = user.intra_name;
    });
    this.form = new FormGroup({
      name: new FormControl("")
    });
    this.form.controls['name'].setAsyncValidators([this.displayNameIsUnique()]);
  }

}

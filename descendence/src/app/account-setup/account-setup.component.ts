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
    console.log("SUBMIT");
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

  displayNameIsUnique(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      let err: ValidationErrors = {
        'notUnique': true
      }
      return of(control.value).pipe(delay(500),switchMap(() => {
        return this.userService.checkDisplayNameAvailability(control.value).pipe(map((available) => {
          if (!available) {
            console.log("INVALID");
            return err;
          }
          console.log("VALID");
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

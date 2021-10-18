import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationError } from 'ajv';
import { Observable, of, timer } from 'rxjs';
import { delay, filter, first, map, switchMap } from 'rxjs/operators';
import { FocusOverlayRef } from '../focus-overlay/focus-overlay.ref';
import { FocusOverlayService } from '../focus-overlay/focus-overlay.service';
import { SharedValidatorService } from '../focus-overlay/shared-validator.service';
import { ImageService} from '../services/image-service.service';
import { UrlService } from '../url.service';
import { UserService } from '../user.service';

@Component({
	selector: 'app-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
	twoFactor: boolean = false;

	@Input()
	displayName: any;
	currentAvatarUrl: string = "";
	settingsForm: FormGroup;
	avatarReset: boolean = false;
	changedAvatarPreview: any;
	selectedAvatarFile: File | null = null;
	initialTwoFactorState: boolean;
	currentUserIntra: string;
	
	constructor(
		private overlay: FocusOverlayService,
		private valid: SharedValidatorService,
		private readonly userService: UserService,
		private readonly imageService: ImageService,
		private readonly route: ActivatedRoute,
		private readonly router: Router,
		private readonly urlService: UrlService,
	) {
	}
	
	selectAvatar(event: any) {
		if (event.target.files.size < 1)
		return ;
		
		this.selectedAvatarFile = event.target.files[0];
		var reader = new FileReader();
		
		reader.addEventListener('load', (event:any) => {
			this.changedAvatarPreview = event.target.result;
			this.avatarReset = false;
		});
		reader.readAsDataURL(event.target.files[0]); // read file as data url
	}
	
	//allows to select an image, reset and then select the same image again
	onClickSelectAvatar(event: any) {
		event.target.value='';
	}
	
	resetAvatar() {
		this.changedAvatarPreview = null;
		this.settingsForm.patchValue({avatar: ""});
		this.selectedAvatarFile = null;
		this.avatarReset = true;
	}
	
	get avatar(): string {
		let style = "background-image: ";
		
		if (this.changedAvatarPreview)
		style += `url(${this.changedAvatarPreview});`
		else if (!this.avatarReset && this.currentAvatarUrl) {
			style += `url(cdn/assets/${this.currentAvatarUrl});`
		}
		else
		style += 'linear-gradient(135.2deg, #C4377B -6.4%, #6839B5 49.35%, #0D6EFF 104.83%, #0D6EFF 104.84%, #0D6EFF 104.85%);'
		return style;
	}
	
	openOverlay() {
		if (!!this.settingsForm.controls['twoFactorEnabled'].value)
			return ;
		let dialogRef: FocusOverlayRef = this.overlay.open();
		return dialogRef;
	}
	
	toggleSwitch(event: Event) {
		const twoFactorForm = this.settingsForm.controls['twoFactorEnabled'];
		if (!twoFactorForm.value) {
			
			const overlay = this.openOverlay();
			overlay?.detachment().subscribe((e) => {
				if (this.valid.valid === true) {
					twoFactorForm.setValue(true);
				}
			},
			(err) => {
				console.log(err);
			})
			event.preventDefault();
		}
	}

	displayNameIsValid(str: string) : boolean {
		var code, i, len;

		len = str.length;
		if (len < 6 || len > 24)
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
						console.log("INVALID");
						err['notValid'] = true;
						return err;
					}
					if (!available) {
						console.log("INVALID");
						err['notUnique'] = true;
						return err;
					}
					console.log("VALID");
					return null;
				}));
			}));
		}
	}

	unblockedUserIsValid(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			let err: ValidationErrors = {
				'noSuchUser': true
			}
			return of(control.value).pipe(delay(500),switchMap(() => {
				if (control.value) {
					return this.userService.userExists(control.value).pipe(map((available) => {
						if (!available || control.value == this.currentUserIntra) {
							return err;
						}
						return null;
					}))
				}
				return of(null);
			}))
		}
	}

	addValidators() {
		this.settingsForm.controls['displayName'].setAsyncValidators([this.displayNameIsUnique()]);
		this.settingsForm.controls['unblock'].setAsyncValidators([this.unblockedUserIsValid()]);
	}
	
	get twoFactorState(): string {
		return this.settingsForm.controls['twoFactorEnabled'].value ? "Enabled" : "Disabled";
	}
	
	saveChanges() {
		let formValues: {[key: string]: any} = {};
		for (const field in this.settingsForm.controls) {
			formValues[field] = this.settingsForm.controls[field].value;
		}
		if (this.avatarReset) {
			this.imageService.delete().subscribe(() => { this.userService.userSource.next(''); });
		}
		else if (formValues['avatar']) {
			this.imageService.upload(this.selectedAvatarFile as File).subscribe(
				(res: any) => {
					this.userService.userSource.next('');
				},
				(err: any) => {
					console.log(err);
				}
				);
		}
		if (formValues['displayName']) {
			this.userService.updateDisplayName(formValues['displayName']).subscribe(() => {});
		}
		if (this.initialTwoFactorState !== formValues['twoFactorEnabled']) {
			this.userService.updateTwoFactor(formValues['twoFactorEnabled']);
		}

		if (formValues['unblock'] && this.settingsForm.controls['unblock'].valid) {
			this.userService.unblockedUser(this.settingsForm.controls['unblock'].value);
			this.settingsForm.controls['unblock'].reset();
		}
	}

	goBack() {
		console.log(`PREVIOUS ROUTE: ${this.urlService.previousUrl}`);
		this.router.navigateByUrl(this.urlService.previousUrl as string);
	}

	ngOnInit(): void {
		this.currentUserIntra = this.route.snapshot.data.user.intra_name;
		this.currentAvatarUrl = this.route.snapshot.data.user.avatar_url;
		this.initialTwoFactorState = this.route.snapshot.data.user.two_factor_enabled;
		this.settingsForm = new FormGroup({
			displayName: new FormControl(""),
			twoFactorEnabled: new FormControl(this.initialTwoFactorState),
			avatar: new FormControl(""),
			unblock: new FormControl("")
		});
		this.addValidators();
	}
}

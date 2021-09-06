import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { ValidationError } from 'ajv';
import { Observable, of, timer } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import { FocusOverlayRef } from '../focus-overlay/focus-overlay.ref';
import { FocusOverlayService } from '../focus-overlay/focus-overlay.service';
import { SharedValidatorService } from '../focus-overlay/shared-validator.service';
import { ImageService} from '../services/image-service.service';
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
	
	constructor(
		private overlay: FocusOverlayService,
		private valid: SharedValidatorService,
		private readonly userService: UserService,
		private readonly imageService: ImageService
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
	addValidator() {
		this.settingsForm.controls['displayName'].setAsyncValidators([this.displayNameIsUnique()]);
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
			this.userService.updateDisplayName(formValues['displayName']);
		}
		if (this.initialTwoFactorState !== formValues['twoFactorEnabled']) {
			this.userService.updateTwoFactor(formValues['twoFactorEnabled']);
		}
	}
	
	ngOnInit(): void {
		this.settingsForm = new FormGroup({
			displayName: new FormControl(""),
			twoFactorEnabled: new FormControl(false),
			avatar: new FormControl("")
		});
		this.addValidator();
		this.settingsForm.controls['twoFactorEnabled'].valueChanges.subscribe((value) => {
			console.log(value);
		});
		this.userService.userSubject.subscribe((user:any) => {
			this.currentAvatarUrl = user.avatar_url;
			this.initialTwoFactorState = user.two_factor_enabled;
			this.settingsForm.patchValue({'twoFactorEnabled': this.initialTwoFactorState});
		});
	}
}

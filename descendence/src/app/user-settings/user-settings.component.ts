import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ImageService} from '../services/image-service.service';
import { UserService } from '../user.service';

@Component({
	selector: 'app-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
	@Input()
	displayName: any;
	currentAvatarUrl: string;
	twoFactorState: string = "Disabled";
	settingsForm: FormGroup;
	url: any;
	selectedAvatarFile: File | null = null;
	
	constructor(
		private readonly userService: UserService,
		private readonly imageService: ImageService
	) {
	}

	//TODO: upload to server
	selectAvatar(event: any) {
		if (event.target.files.size < 1)
			return ;

		this.selectedAvatarFile = event.target.files[0];
		var reader = new FileReader();

		reader.addEventListener('load', (event:any) => {
			this.url = event.target.result;
		});
		reader.readAsDataURL(event.target.files[0]); // read file as data url
	}

	//allows to select an image, reset and then select the same image again
	onClickSelectAvatar(event: any) {
		event.target.value='';
	}

	resetAvatar() {
		this.url = null;
		this.settingsForm.patchValue({avatar: ""});
		this.selectedAvatarFile = null;
		this.imageService.delete().subscribe(() => {});
	}

	get avatar(): string {
		let style = "background-image: ";

		if (this.url)
			style += `url(${this.url});`
		else if (this.currentAvatarUrl) {
			style += `url(cdn/assets/${this.currentAvatarUrl});`
		}
		else
			style += 'linear-gradient(135.2deg, #C4377B -6.4%, #6839B5 49.35%, #0D6EFF 104.83%, #0D6EFF 104.84%, #0D6EFF 104.85%);'
		return style;
	}

	saveChanges() {
		console.warn(this.settingsForm.value);
		let madeChanges: boolean = false;
		let avatar

		let formValues: {[key: string]: string} = {};
		for (const field in this.settingsForm.controls) {
			formValues[field] = this.settingsForm.controls[field].value;
		}
		console.log(`FORMVALUES: ${JSON.stringify(formValues)}`);
		if (formValues['avatar']) {
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
			console.log("NEW NAME ENTERED");
			this.userService.updateDisplayName(formValues['displayName']);
		}
	}

	ngOnInit(): void {
		this.settingsForm = new FormGroup({
			displayName: new FormControl(""),
			twoFactorEnabled: new FormControl(true), //fetch from user entry
			avatar: new FormControl("")
		});
		this.userService.userSubject.subscribe((user:any) => {
			this.currentAvatarUrl = user.avatar_url;
		});
	}
}

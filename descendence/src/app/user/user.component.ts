import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../user.service';


class UpdateNameForm {
	submitted = false;
	onSubmit() { this.submitted = true; }
}

@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss']
})

export class UserComponent implements OnInit {
	displayName: string = "";
//	form: NgForm;

	constructor( private readonly userService: UserService) {
	}

	onSubmit(f: NgForm) {
		console.log(f.form.value.new);
		const newDisplayName = f.form.value.new;
		this.displayName = newDisplayName;
		this.userService.updateDisplayName(newDisplayName).subscribe(() => {});
//		this.displayName = f.form.value.new;
	}

	async ngOnInit(): Promise<void> {
		this.userService.getCurrentUser().subscribe((data: any) => {this.displayName = data.display_name});
	}
}

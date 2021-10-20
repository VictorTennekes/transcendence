import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../search/search.service';

@Component({
  selector: 'app-chat-pass',
  templateUrl: './chat-pass.component.html',
  styleUrls: ['./chat-pass.component.scss'],
  providers: [SearchService]
})
export class ChatPassComponent implements OnInit {
	hide = true;
	wrongPass: boolean = false;
	constructor(public router: Router,
				public formBuilder: FormBuilder,
				public searchService: SearchService,
				private route: ActivatedRoute) { }

	chatPassForm = new FormGroup ({
		password: new FormControl('')
	})

	ngOnInit(): void {
	}

	public back() {
		this.router.navigate(['', {outlets: {chat: ['search', ""]}}]);
	}
	
	public onSubmit() {
		this.wrongPass = false;
		this.route.params.subscribe((params) => {
			let id: string = params['id'];
			this.searchService.validatePassword(this.chatPassForm.controls['password'].value, params['id']).subscribe(
			(response) => {
				if (response === true) {
					this.searchService.addUserToChat(id).subscribe((response) => {
						this.router.navigate(['', {outlets: {chat: ['get-chat', id]}}]);
					});
				} else {
					this.wrongPass = true;

				}
			}
		)
		});	
		
	}
}

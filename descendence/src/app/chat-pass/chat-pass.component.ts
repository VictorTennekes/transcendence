import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../components/search/search.service';

@Component({
  selector: 'app-chat-pass',
  templateUrl: './chat-pass.component.html',
  styleUrls: ['./chat-pass.component.scss'],
  providers: [SearchService]
})
export class ChatPassComponent implements OnInit {
	hide = true;

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
		// this.router.navigateByUrl('/search');
		this.router.navigate(['home', {outlets: {chat: 'search'}}], {skipLocationChange: true});
	}
	
	public onSubmit() {
		console.log(history.state);
		console.log(this.route.params.subscribe((params) => {
			let id: string = params['id'];
			this.searchService.validatePassword(this.chatPassForm.controls['password'].value, params['id']).subscribe(
			// this.searchService.validatePassword(this.chatPassForm.controls['password'].value, history.state.id).subscribe(
			(response) => {
				console.log(response);
				if (response === true) {
					// this.router.navigateByUrl('/chat', {state: history.state});
					console.log("correct pass");
					console.log(id);
					this.searchService.addUserToChat(id).subscribe((response) => {
						console.log("waited?");
						console.log(response);
						this.router.navigate(['home', {outlets: {chat: ['get-chat', id]}}]);
					});
				} else {
					//validation failed
					console.log("wrong pass");
				}
			}
		)
		}));	
		
	}
}

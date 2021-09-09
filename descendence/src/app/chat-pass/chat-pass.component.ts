import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
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
				public searchService: SearchService) { }

	chatPassForm = new FormGroup ({
		password: new FormControl('')
	})

	ngOnInit(): void {
	}

	public back() {
		// this.router.navigateByUrl('/search');
		this.router.navigate([{outlets: {chat: 'search'}}]);
	}

	public onSubmit() {
		console.log(history.state);
		this.searchService.validatePassword(this.chatPassForm.controls['password'].value, history.state.id).subscribe(
			(response) => {
				console.log(response);
				if (response === true) {
					this.router.navigateByUrl('/chat', {state: history.state});
				} else {
					//validation failed
					console.log("wrong pass");
				}
			}
		)
	}
}

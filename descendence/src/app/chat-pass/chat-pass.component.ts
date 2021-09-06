import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SearchService } from '../components/search/search.service';

@Component({
  selector: 'app-chat-pass',
  templateUrl: './chat-pass.component.html',
  styleUrls: ['./chat-pass.component.scss'],
  providers: [SearchService]
})
export class ChatPassComponent implements OnInit {
	hide = true;

	plainText: string = "";
	constructor(public formBuilder: FormBuilder,
				public searchService: SearchService) { }

	chatPassForm = new FormGroup ({
		password: new FormControl('')
	})

	ngOnInit(): void {
	}

	public onSubmit() {
		// if (this.searchService.validatePassword(this.plainText)) {

		// }
	}
}

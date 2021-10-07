import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../user.service';
import { userModel } from '../chat/chat-client/message.model';


@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss']
})

export class UserComponent implements OnInit {
	displayName: string = "";
	loggedInUser: userModel;
//	form: NgForm;

	constructor( private readonly userService: UserService) {
	}

	public getUserAvatar(avatar_url: string | null) {
		let style = "background-image: ";
		
		if (avatar_url) {
			style += `url(cdn/assets/${avatar_url});`
		}
		else
			style += 'linear-gradient(135.2deg, #C4377B -6.4%, #6839B5 49.35%, #0D6EFF 104.83%, #0D6EFF 104.84%, #0D6EFF 104.85%);'
		return style;
	}



	async ngOnInit(): Promise<void> {
		this.userService.getCurrentUser().subscribe((data: any) => {
			this.loggedInUser = data;
			console.log(this.loggedInUser)
			this.userService.getFriends(this.loggedInUser.intra_name).subscribe((res: userModel[]) => {
				console.log(res);
				if (res) {
					this.loggedInUser.friends = res;
				} else {
					this.loggedInUser.friends = [];
				}
			})
		});
	}
}

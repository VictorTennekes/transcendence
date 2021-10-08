import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../user.service';
import { userModel } from '../chat/chat-client/message.model';
import { MatchService } from '../match.service';


@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss']
})

export class UserComponent implements OnInit {
	loggedInUser: userModel;
	onlineFriends: userModel[] = [];
	offlineFriends: userModel[] = [];
	friends: userModel[] = [];

//	form: NgForm;

	constructor( private readonly userService: UserService,
				private matchService: MatchService) {
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

	trackFriendStatus() {
		this.matchService.friendConnected().subscribe((onlineFriend: userModel) => {
			const index = this.offlineFriends.findIndex(x => x.intra_name === onlineFriend.intra_name);
			this.offlineFriends.splice(index, 1);
			this.onlineFriends.push(onlineFriend);
		});
		this.matchService.friendDisconnected().subscribe((offlineFriend: userModel) => {
			const index = this.offlineFriends.findIndex(x => x.intra_name === offlineFriend.intra_name);
			this.onlineFriends.splice(index, 1);
			this.offlineFriends.push(offlineFriend);
		})
		this.matchService.requestOnlineFriends();
	}

	async ngOnInit(): Promise<void> {
		this.userService.getCurrentUser().subscribe((data: any) => {
			this.loggedInUser = data;
			data.friends = [];
			console.log(this.loggedInUser)
			this.userService.getFriends(this.loggedInUser.intra_name).subscribe((res: userModel[]) => {
				console.log(res);
				if (res) {
					this.loggedInUser.friends = res;
					this.trackFriendStatus();
				} else {
					this.loggedInUser.friends = [];
				}
			})
		});
	}
}

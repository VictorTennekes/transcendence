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
		for (let friend of this.friends) {
			this.offlineFriends.push(friend);
		}
		this.matchService.friendConnected().subscribe((onlineFriend: userModel) => {
			let index = this.offlineFriends.findIndex(x => x.intra_name === onlineFriend.intra_name);
			if (index !== -1) {
				this.offlineFriends.splice(index, 1);
			}
			index = this.onlineFriends.findIndex(x => x.intra_name === onlineFriend.intra_name);
			if (index === -1) {
				this.onlineFriends.push(onlineFriend);
			}
		});
		this.matchService.friendDisconnected().subscribe((offlineFriend: userModel) => {
			if (this.friends.findIndex(x => x.intra_name === offlineFriend.intra_name) !== -1) {
				let index = this.onlineFriends.findIndex(x => x.intra_name === offlineFriend.intra_name);
				if (index !== -1) {
					this.onlineFriends.splice(index, 1);
				}
				index = this.offlineFriends.findIndex(x => x.intra_name === offlineFriend.intra_name);
				if (index === -1) {
					this.offlineFriends.push(offlineFriend);
				}
			}
		})
			
		this.matchService.requestOnlineFriends();
	}

	async ngOnInit(): Promise<void> {
		this.userService.getCurrentUser().subscribe((data: any) => {
			this.loggedInUser = data;
			console.log(this.loggedInUser)
			this.userService.getFriends(this.loggedInUser.intra_name).subscribe((res: userModel[]) => {
				console.log(res);
				this.friends = res;
				this.trackFriendStatus();
			})
		});
	}
}

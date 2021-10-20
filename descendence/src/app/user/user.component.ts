import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../user.service';
import { userModel } from '../chat/chat-client/message.model';
import { MatchService } from '../match.service';
import { GameService } from '../game.service';
import { ClientService } from '../game/client.service';


@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss']
})

export class UserComponent implements OnInit {
	loggedInUser: userModel;
	onlineFriends: [userModel, string][] = [];
	offlineFriends: [userModel, string][] = [];
	inGameFriends: [userModel, string][] = [];
	friends: userModel[] = [];
	friendStats: [userModel, string][] = [];

//	form: NgForm;

	constructor(private readonly userService: UserService,
				private matchService: MatchService,
				private clientService: ClientService) { }

	public getUserAvatar(avatar_url: string | null) {
		let style = "background-image: ";
		
		if (avatar_url) {
			style += `url(cdn/assets/${avatar_url});`
		}
		else
			style += 'linear-gradient(135.2deg, #C4377B -6.4%, #6839B5 49.35%, #0D6EFF 104.83%, #0D6EFF 104.84%, #0D6EFF 104.85%);'
		return style;
	}

	private reSortArrays() {
		this.offlineFriends = this.friendStats.filter((element) => {return (element[1] === "offline")});
		this.onlineFriends = this.friendStats.filter((element) => {return (element[1] === "online")});
		this.inGameFriends = this.friendStats.filter((element) => {return (element[1] === "inGame")});
	}

	addFriends() {
		this.friendStats = [];
		for (const friend of this.friends) {
			this.friendStats.push([friend, "offline"]);
		}
	}

	trackFriendStatus() {
		this.addFriends();
		this.matchService.friendConnected().subscribe((onlineFriend: userModel) => {
			for (const friendStatus of this.friendStats) {
				if (friendStatus[0].intra_name === onlineFriend.intra_name) {
					friendStatus[1] = "online";
				}
			}
			this.reSortArrays();
		});
		this.matchService.friendDisconnected().subscribe((offlineFriend: userModel) => {
			for (const friendStatus of this.friendStats) {
				if (friendStatus[0].intra_name === offlineFriend.intra_name) {
					friendStatus[1] = "offline";
				}
			}
			this.reSortArrays();
		})
		this.matchService.friendInGame().subscribe((inGameFriend: userModel) => {
			for (const friendStatus of this.friendStats) {
				if (friendStatus[0].intra_name === inGameFriend.intra_name) {
					friendStatus[1] = "inGame";
				}
			}
			this.reSortArrays();
		})
		this.matchService.requestOnlineFriends();
		this.reSortArrays();
	}

	async ngOnInit(): Promise<void> {
		this.matchService.removeNotifier.subscribe((user: userModel) => {
			setTimeout(() => {
				this.userService.getFriends(this.loggedInUser.intra_name).subscribe((res: userModel[]) => {
					this.friends = res;
					this.addFriends();
					this.matchService.requestOnlineFriends();
					this.reSortArrays()
					// this.trackFriendStatus();
				})
			}, 3000);
		})
		this.matchService.acceptNotifier.subscribe((user: userModel) => {
			setTimeout(() => {
				this.userService.getFriends(this.loggedInUser.intra_name).subscribe((res: userModel[]) => {
					this.friends = res;
					this.addFriends();
					this.matchService.requestOnlineFriends();
					this.reSortArrays()
					// this.trackFriendStatus();
				})
			}, 3000);
			
		})
		this.userService.getCurrentUser().subscribe((data: any) => {
			this.loggedInUser = data;
			this.userService.getFriends(this.loggedInUser.intra_name).subscribe((res: userModel[]) => {
				this.friends = res;
				this.trackFriendStatus();
			})
		});
		this.clientService.gameFinishedGlobal().subscribe(() => {
			setTimeout(() => {
				this.matchService.requestOnlineFriends();
				this.reSortArrays()
			}, 3000);
		})
	}
}

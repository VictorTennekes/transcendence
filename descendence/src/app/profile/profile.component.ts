import { Component, OnInit } from '@angular/core';
import { UserEntity, UserService } from '../user.service';
import { ActivatedRoute } from '@angular/router';
import { secondsToDhms } from '../game/post/post.component';
import { MatchService } from '../match.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
	
	constructor(
		private userService: UserService,
		private route: ActivatedRoute,
		private matchService: MatchService,
		// private ref: ChangeDetectorRef
	) { }
	
	displayName: string = "";
	avatarUrl: string = "";
	loginId: string = "";
	user: any;
	isFriend: boolean = true;
	isBlocked: boolean = true;
	isOnline: boolean;
	currentUser: string;
	profileOfCurrentUser: boolean = true;

	addFriend() {
		console.log(`FRIEND ADDED`);
		this.matchService.sendFriendRequest(this.loginId);
	}

	removeFriend() {
		console.log(`FRIEND REMOVED`);
		this.userService.removeFriend(this.loginId);
	}

	addBlock() {
		this.userService.addBlockedUser(this.loginId).subscribe(() =>  {
			// this.isBlocked = true;
			this.userService.updateUserSource();
		});
		console.log(`USER BLOCKED`);
	}
	removeBlock() {
		console.log(`USER UNBLOCKED`);
		this.userService.unblockedUser(this.loginId);
		// this.isBlocked = false;
	}

	sendMessage() {
		console.log(`MESSAGE SENT`);
	}

	get avatar() {
		let style = "background-image: ";
		
		if (this.avatarUrl) {
			style += `url(cdn/assets/${this.avatarUrl});`
		}
		else {
			style += 'linear-gradient(135.2deg, #C4377B -6.4%, #6839B5 49.35%, #0D6EFF 104.83%, #0D6EFF 104.84%, #0D6EFF 104.85%);'
		}
		return style;
	}
	
	ngOnInit(): void {
		this.route.data.subscribe((data: any) => {
			this.currentUser = data.currentUser.intra_name;
			this.displayName = data.user.display_name;
			this.loginId = data.user.intra_name;
			this.avatarUrl = data.user.avatar_url;
			this.isFriend = data.friend;
			this.profileOfCurrentUser = (this.currentUser === this.loginId);
			this.isOnline = data.online;
			console.log(`USER ONLINE: ${this.isOnline}`);
		});
		this.userService.userSubject.subscribe((user) => {
			this.userService.isBlocked(this.loginId).subscribe((state: boolean) => {
				console.log(`RECEIVED BLOCKED STATE: ${state}`);
				this.isBlocked = state;
			});
			this.userService.isFriend(this.loginId).subscribe((state: boolean) => {
				console.log(`RECEIVED FRIEND STATE: ${state}`);
				this.isFriend = state;
			});
			this.matchService.removeNotifier.subscribe(() => {
				this.userService.isFriend(this.loginId).subscribe((state: boolean) => {
					this.isFriend = state;
				});
			})
			this.userService.friendSubject.subscribe((friends) => {
				const result = friends.some(user => user.intra_name === this.loginId);
				console.log(`FRIENDSUBJECT - ISFRIEND - ${result}`);
				this.isFriend = result;
				// this.ref.detectChanges();
			});
			this.matchService.acceptNotifier.subscribe(() => {
				this.userService.isFriend(this.loginId).subscribe((state: boolean) => {
					this.isFriend = state;
				});
			})
		});
	}
}

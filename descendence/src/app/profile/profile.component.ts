import { Component, OnInit } from '@angular/core';
import { UserEntity, UserService } from '../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { secondsToDhms } from '../game/post/post.component';
import { MatchService } from '../match.service';
import { ChatService } from '../chat/chat-client/chat.service';
import { chatModel, userModel } from '../chat/chat-client/message.model';
import { SearchService } from '../chat/search/search.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss'],
	providers: [SearchService]
})
export class ProfileComponent implements OnInit {
	
	constructor(
		private userService: UserService,
		private route: ActivatedRoute,
		private matchService: MatchService,
		private readonly searchService: SearchService,
		private readonly router: Router,
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
		this.matchService.sendFriendRequest(this.loginId);
	}

	removeFriend() {
		this.userService.removeFriend(this.loginId);
	}

	addBlock() {
		this.userService.addBlockedUser(this.loginId).subscribe(() =>  {
			// this.isBlocked = true;
			this.userService.updateUserSource();
		});
	}
	removeBlock() {
		this.userService.unblockedUser(this.loginId);
		// this.isBlocked = false;
	}

	sendMessage() {
		this.searchService.findMatchingChats(this.loginId).subscribe((chats: chatModel[]) => {
			const dm = chats.filter((chat) => chat.visibility === 'direct');
			if (dm.length !== 1)
				return ;
			this.router.navigate(['', {outlets: {chat: ['get-chat', dm[0].id]}}]);;
		});
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
		});
		this.userService.userSubject.subscribe((user) => {
			this.userService.isBlocked(this.loginId).subscribe((state: boolean) => {
				this.isBlocked = state;
			});
			this.userService.isFriend(this.loginId).subscribe((state: boolean) => {
				this.isFriend = state;
			});
			this.matchService.removeNotifier.subscribe((user: userModel) => {
				setTimeout(() => {
					this.userService.isFriend(this.loginId).subscribe((state: boolean) => {
						this.isFriend = state;
					});
				}, 2000)

			})
			this.userService.friendSubject.subscribe((friends) => {
				const result = friends.some(user => user.intra_name === this.loginId);
				this.isFriend = result;
				// this.ref.detectChanges();
			});
			this.matchService.acceptNotifier.subscribe((user: userModel) => {
				setTimeout(() => {
					this.userService.isFriend(this.loginId).subscribe((state: boolean) => {
						this.isFriend = state;
					});
				}, 1000)
			})
		});
	}
}

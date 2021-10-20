import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewChecked, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../search/search.service';
import { ChatService } from './chat.service';
import { retMessage, newMessage, chatModel, userModel } from './message.model';
import { UserService } from 'src/app/user.service';
import { MatchComponent } from 'src/app/match/match.component';
import { MatchService } from 'src/app/match.service';
@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.scss'],
	providers: [ChatService, SearchService]
  })
  export class ChatComponent implements OnInit, AfterViewChecked {
	@ViewChild('scrollMe') private myScrollContainer!: ElementRef;

	scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) { }                 
    }

	constructor(
		  private formBuilder: FormBuilder,
		  private chatService: ChatService,
		  private searchService: SearchService,
		  private userService: UserService,
		  private router: Router,
		  private route: ActivatedRoute,
		  private matchService: MatchService
	  ) { 
		this.loggedInUser = {
			intra_name: "",
			display_name: "",
			avatar_url: "",
			friends: [],
			blockedByUsers: []
		}
	  }

	public chat: chatModel = {
		id: "",
		name: "",
		users: [],
		admins: [],
		messages: [],
		visibility: ""
	};
	messageForm = this.formBuilder.group({
		message: "",
	});
	public default_avatar_url = "";
	public errorMessage: string = "";
	public userIsAdmin: boolean = false;
	public loggedInUser: userModel = {
		intra_name: "",
		display_name: "",
		avatar_url: "",
		friends: [],
		blockedByUsers: []
	}

	ngOnInit(): void {
		
		this.chatService.listenForError().subscribe((error: string) => {
			console.log(error);
			this.errorMessage = error;
		})


		this.userService.getCurrentUser().subscribe((data: any) => {
			this.loggedInUser = data;
			this.userService.getFriends(this.loggedInUser.intra_name).subscribe((friends: userModel[]) => {
				if (friends) {
					this.loggedInUser.friends = friends;
				}
			})
			this.userService.getBlockedByUser().subscribe((blocks: userModel[]) => {
				if (blocks) {
					this.loggedInUser.blockedByUsers = blocks;
				}
			})
		});
		this.route.params.subscribe(params => {
			this.searchService.findChatById(params['id']).subscribe((response) => {
				this.chat = response;
				this.searchService.userInChat(this.chat.id).subscribe((isTrue: boolean) => {
					if (isTrue === false) {
						this.searchService.addUserToChat(this.chat.id).subscribe((updatedChat: chatModel) => {
							this.chat.users = updatedChat.users;
						})
					}
				})
				this.searchService.userIsAdmin(this.chat.id).subscribe((result) => {
					this.userIsAdmin = result;
				});
				this.chatService.receiveMessages().subscribe((msg) => {
					if (msg.chat.id === this.chat.id) {
						this.chat.messages.push(msg);
					}
					this.scrollToBottom();
				})
			});
		});

	}

	ngAfterViewChecked() : void {
		this.scrollToBottom();
	}

	public isLoggedInUser(username: string): boolean {
		return (username === this.loggedInUser.intra_name);
	}

	public isBlocked(username: string): boolean {
		if (this.loggedInUser && this.loggedInUser.blockedByUsers) {
			for (let block of this.loggedInUser.blockedByUsers) {
				if (block.intra_name === username) {
					return true;
				}
			}
		}
		return false;
	}

	navToUserProfile(username: string) {
		this.router.navigate(['/profile', username]);
	}

	public canInvite(username: string): boolean {
		if (username === this.loggedInUser.intra_name) {
			return false;
		}
		return (!this.isBlocked(username))
	}

	public back() {
		this.router.navigate(['', {outlets: {chat: ['search', ""]}}]);
	}

	public edit() {
		if (this.userIsAdmin) {
			this.router.navigate(['', {outlets: {chat: ['settings', this.chat.id]}}])
		}
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

	public openProfile(login: string) {
		this.router.navigate(['profile', login])
	}

	public inviteToGame(username: string) {
		this.router.navigate(['play', username])
	}

	public async leave() {
		await this.searchService.leaveChat(this.chat.id);
		this.back();
	}

	public blockUser(username: string) {
		this.userService.addBlockedUser(username).subscribe(() => {
			this.route.params.subscribe(params => {
				this.searchService.findChatById(params['id']).subscribe((response) => {
					this.chat = response;
					console.log(this.chat);
				});
			});
			this.userService.updateUserSource();
		});
	}

	public addFriend(username: string) {
		this.matchService.sendFriendRequest(username);
	}

	public isFriend(username: string): boolean {
		if (this.loggedInUser && this.loggedInUser.friends) {
			for (let friend of this.loggedInUser.friends) {
				if (friend.intra_name === username) {
					return true;
				}
			}
		}
		return false;
	}

	public removeFriend(username: string) {
		this.userService.removeFriend(username);
		this.userService.getFriends(this.loggedInUser.intra_name).subscribe((friends: userModel[]) => {
			if (friends) {
				this.loggedInUser.friends = friends;
			}
		})
	}

	public onSubmit() {
		this.errorMessage = "";
		const newMessage: newMessage = {
			chat: this.chat.id,
			message: this.messageForm.controls['message'].value
		}
		this.chatService.sendMessage(newMessage);
		this.messageForm.reset();
	}
}
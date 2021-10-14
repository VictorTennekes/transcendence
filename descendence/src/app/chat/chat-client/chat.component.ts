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
	  ) { }

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
	public loggedInUser: string = "";

	ngOnInit(): void {
		
		this.chatService.listenForError().subscribe((error: string) => {
			console.log(error);
			this.errorMessage = error;
		})


		this.userService.getCurrentUser().subscribe((data: any) => {
			this.loggedInUser = data.display_name;
		});
		console.log("logged in user is: ", this.loggedInUser)
		console.log(this.chat);
		this.route.params.subscribe(params => {
			this.searchService.findChatById(params['id']).subscribe((response) => {
				console.log("found chat by id");
				// console.log(response);
				this.chat = response;
				console.log(this.chat);
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
				console.log("here?");
				this.chatService.receiveMessages().subscribe((msg) => {
						console.log("chat is");
						console.log(this.chat);
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
		return (username === this.loggedInUser);
	}

	public isNotBlocked(username: string): boolean {
		//TODO: check if user is blocked
		return true;
	}

	public canInvite(username: string): boolean {
		return (this.isLoggedInUser(username) && this.isNotBlocked(username))
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
		});
	}

	public addFriend(username: string) {
		this.matchService.sendFriendRequest(username);
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
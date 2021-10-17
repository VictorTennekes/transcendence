import { HttpClient, HttpRequest } from '@angular/common/http';
import { Component, Input, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import "@fontsource/fredoka-one";
import { CookieService } from 'ngx-cookie';
import { UserService } from '../user.service';
import { MatchSettings, MatchService } from '../match.service';
// import {MatDialog} from '@angular/material/dialog';
import { AcceptComponent } from '../accept/accept.component';
// import { MAT_DIALOG_DATA } from '@angular/material/dialog';
// import {DialogData}
// import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MatDialogContainer, MAT_DIALOG_DATA, MatDialogConfig} from '@angular/material/dialog';
import { MatchSocket } from '../match/match.socket';
import { MatchComponent } from '../match/match.component';
import { AcceptService } from '../accept.service';

@Component({
	selector: 'app-master',
	templateUrl: './master.component.html',
	styleUrls: ['./master.component.scss',
				'./invite.scss']
})
export class MasterComponent implements OnInit {
	
	displayName: string = "";
	avatarStyle: string = "";

	constructor(
		private readonly router: Router,
		private userService: UserService,
		private cookies: CookieService,
		private matchService: MatchService,
		public dialog: MatDialog,
		private readonly matchSocket: MatchSocket,
		private readonly acceptService: AcceptService,
	) { }

	updateAvatar(url: string | null) {
		let style = "background-image: ";

		if (url)
			style += `url(cdn/assets/${url});`
		else
			style += 'linear-gradient(135.2deg, #C4377B -6.4%, #6839B5 49.35%, #0D6EFF 104.83%, #0D6EFF 104.84%, #0D6EFF 104.85%);'
		return style;
	}

	ngOnInit(): void {
		this.userService.userSubject.subscribe((user: any) => {
//			console.log(`NG_ON_INIT user: ${JSON.stringify(user)}`);
			this.displayName = user.display_name;
			this.avatarStyle = this.updateAvatar(user.avatar_url);
		});

		this.matchService.matchInviteListener.subscribe((res: any) => {
			this.openDialog(res);
			// this.router.navigate(['play', res]);
		})
		this.matchService.receiveFriendRequest().subscribe((res: any) => {
			this.openFriendRequest(res);
		})
	}


	openFriendRequest(user: any) {
		const dialogConfig: MatDialogConfig = new MatDialogConfig();
		const dialogRef = this.dialog.open(friendRequestDialog, {
			data: {username: user.display_name},
			panelClass: 'invite-dialog'
		});
		dialogRef.afterClosed().subscribe((accepted: boolean) => {
			console.log(`Dialog result: ${accepted}`);
			if (accepted) {
				this.matchService.acceptFriendRequest(user);
			}
		});
	}

	openDialog(settings: {host: string, id: string}) {
		const dialogConfig: MatDialogConfig = new MatDialogConfig();

		const dialogRef = this.dialog.open(InviteComponent, {
			data: settings,
			panelClass: 'invite-dialog'
		});
		dialogRef.afterClosed().subscribe(result => {
			console.log(`Dialog result: ${result}`);
			if (result) {
				// console.log("navigating to game");
				this.router.navigate(['play', settings.host])
				this.matchService.readyListener.subscribe(() => {
					this.acceptService.open();
				})
				this.matchSocket.emit('invite_accepted', settings.id);
			} else {
				console.log("declining invite: ", settings);
				if (settings.host) {
					this.matchService.inviteDeclined(settings.host);
				}
			}
		});
	}

	logOut(): void {
		console.log('is the error here?')
		this.userService.logout().subscribe((error: any) => {
			console.log('response');
			console.log(error);
		});
		this.cookies.remove('connect.sid');
		// this.router.navigate(['home']);
		console.log('where is the error');
		location.reload();
		console.log('is error here');
		// this.router.navigate([{outlets: {primary: 'home'}}]);
	}
}

// , {
	// width: '250px',
	// data: {name: this.name, animal: this.animal}
//   }


@Component({
	selector: 'invite-component',
	templateUrl: './invite.html',
	styleUrls: ['./invite.scss'],
	providers: [MatDialogContainer, MatDialogConfig]
  })
  export class InviteComponent {
	//   @Input()
	//   username: string = "";

	constructor(
		public dialogRef: MatDialogRef<InviteComponent>,
		@Inject(MAT_DIALOG_DATA) public data: {host: string, id: string}) {}

	  public accept() {
		  this.dialogRef.close(true);
		  //create game and navigate to game


		// this.router.navigate(['game']);
		  //emit events in both these cases

	  }

	  public close() {
		  //emit not accepted event
			this.dialogRef.close(false);

	  }
  }

@Component({
	selector: 'friend-request-dialog',
	templateUrl: './friend-request.html',
	styleUrls: ['./invite.scss'],
	providers: [MatDialogContainer, MatDialogConfig]
  })
  export class friendRequestDialog {
	//   @Input()
	//   username: string = "";

	constructor(
		public dialogRef: MatDialogRef<friendRequestDialog>,
		@Inject(MAT_DIALOG_DATA) public data: any) {}

	  public accept() {
		  this.dialogRef.close(true);
		  //create game and navigate to game


		// this.router.navigate(['game']);
		  //emit events in both these cases

	  }

	  public close() {
		  //emit not accepted event
			this.dialogRef.close(false);

	  }
  }
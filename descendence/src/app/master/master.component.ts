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
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
	selector: 'app-master',
	templateUrl: './master.component.html',
	styleUrls: ['./master.component.scss']
})
export class MasterComponent implements OnInit {
	
	displayName: string = "";
	avatarStyle: string = "";

	constructor(
		private readonly router: Router,
		private userService: UserService,
		private cookies: CookieService,
		private matchService: MatchService,
		public dialog: MatDialog
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

		this.matchService.receiveGameInvite().subscribe((res: any) => {
			this.openDialog(res);
			// this.router.navigate(['play', res]);
		})
	}

	openDialog(user: any) {
		const dialogRef = this.dialog.open(DialogContentExampleDialog, {
			data: {username: user}
		});
		dialogRef.afterClosed().subscribe(result => {
			console.log(`Dialog result: ${result}`);
			if (result) {
				console.log("navigating to game");
				// let settings: MatchSettings = {
					// opponent_username: user
				// }
				// this.matchService.findMatch(settings);
				this.router.navigate(['play', user])
				//navigate to play tag with username
			} else {
				console.log("declining invite: ", user);
				this.matchService.inviteDeclined(user);
				//emit error
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
		this.router.navigate(['auth']);
		console.log('is error here');
		// this.router.navigate([{outlets: {primary: 'home'}}]);
	}
}

// , {
	// width: '250px',
	// data: {name: this.name, animal: this.animal}
//   }


@Component({
	selector: 'dialog-content-example-dialog',
	templateUrl: './invite.html',
	styleUrls: ['./invite.scss']
  })
  export class DialogContentExampleDialog {
	//   @Input()
	//   username: string = "";

	constructor(
		public dialogRef: MatDialogRef<DialogContentExampleDialog>,
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
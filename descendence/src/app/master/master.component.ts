import { HttpClient, HttpRequest } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import "@fontsource/fredoka-one";
import { CookieService } from 'ngx-cookie';
import { UserService } from '../user.service';

@Component({
	selector: 'app-master',
	templateUrl: './master.component.html',
	styleUrls: ['./master.component.scss']
})
export class MasterComponent implements OnInit {
	
	displayName: string = "";
	avatarStyle: string = "";
	loginId: string ="";

	constructor(
		private readonly router: Router,
		private userService: UserService,
		private cookies: CookieService,
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
			this.loginId = user.intra_name;
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

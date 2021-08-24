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

	constructor(
		private readonly router: Router,
		private userService: UserService,
		private cookies: CookieService,
	) { }
	
	ngOnInit(): void {
		this.userService.getCurrentUser().subscribe((data: any) => {this.displayName = data.display_name});
	}

	logOut(): void {
		this.userService.logout().subscribe(() => {});
		this.cookies.remove('connect.sid');
		this.router.navigate(['home']);
	}
}

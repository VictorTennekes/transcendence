import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	
	public user = {'email':'nobody@unknown.com'};
	constructor( private userService: UserService) { }

	ngOnInit(): void {
		// window.location.href = "http://localhost:3000/user/home";
	}
	onClick() : void {
		document.location.href = "api/auth/redirect";
	}
}

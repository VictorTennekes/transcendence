import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	
	constructor( private readonly http: HttpClient) { }

	ngOnInit(): void {
		// window.location.href = "http://localhost:3000/user/home";
	}
	async onClick() : Promise<any> {
		// console.log('Clicked');
		let request_headers = new HttpHeaders();
		// .set('Content-Type', 'text/plain')
		// .set('Access-Control-Allow-Origin', 'http://localhost:3000')
		// .set('Access-Control-Allow-Methods','GET, POST, PATCH, PUT, DELETE, OPTIONS')
		// .set('Access-Control-Allow-Headers','Origin, Content-Type, X-Auth-Token');
	
		console.log(request_headers);
		const body = this.http.get('/user/home', { headers: request_headers});
		body.subscribe((event) => {console.log(event)});
	}
}

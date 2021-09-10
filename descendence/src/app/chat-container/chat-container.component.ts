import { Route } from '@angular/compiler/src/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss']
})
export class ChatContainerComponent implements OnInit {

	constructor(private router: Router) {
		console.log(this.router.url);
		this.router.events.subscribe((event) => {
			console.log(event)
			if (event instanceof NavigationEnd && !event.url.includes("(")) {
				console.log("url is: ", event.url);
				this.router.navigate(['home', {outlets: {chat: 'search'}}]);
			} else if (event instanceof NavigationEnd && event.url.includes("(")) {
				console.log("doesnt contain thing: ", event.url);
			} else {
				console.log("nup");
			}
		})
	}

	ngOnInit(): void {
	}

}

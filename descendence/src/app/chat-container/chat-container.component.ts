import { Route } from '@angular/compiler/src/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';
import { RoutesRecognized } from '@angular/router';
import { pairwise } from 'rxjs/operators';

@Component({
  selector: 'chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss']
})
export class ChatContainerComponent implements OnInit {

	constructor(private router: Router) {
		// console.log(this.router.url);
		// this.router.events.subscribe((event) => {
		// 	console.log(event)
		// 	if (event instanceof NavigationEnd && !event.url.includes("(")) {
		// 		console.log("url after redir: ", event.urlAfterRedirects);
		// 		console.log("url is: ", event.url);
		// 		this.router.navigate(['home', {outlets: {chat: 'search'}}]);
		// 	} else if (event instanceof NavigationEnd && event.url.includes("(")) {
		// 		console.log("doesnt contain thing: ", event.url);
		// 	} else {
		// 		console.log("nup");
		// 	}
		// })

		this.router.events
		.pipe(filter((evt: any) => evt instanceof RoutesRecognized), pairwise())
		.subscribe((events: RoutesRecognized[]) => {
		  console.log('previous url', events[0].urlAfterRedirects);
		  console.log('current url', events[1].urlAfterRedirects);
		  if (!events[1].urlAfterRedirects.includes("(")) {
			if (events[0].urlAfterRedirects.includes("(")) {
				//navlgate to previous aux route
				let chaturl: string = events[0].urlAfterRedirects.substring(events[0].urlAfterRedirects.indexOf(":") + 1, events[0].urlAfterRedirects.indexOf(")"));
				console.log("redirecting to: ", events[1].urlAfterRedirects);
				console.log("chat url: ", chaturl);
				this.router.navigate([events[1].urlAfterRedirects, {outlets: {chat: chaturl}}])
			} else {
				this.router.navigate([events[1].urlAfterRedirects, {outlets: {chat: 'search'}}]);
			}

		  }
		});
	}

	ngOnInit(): void {
	}

}

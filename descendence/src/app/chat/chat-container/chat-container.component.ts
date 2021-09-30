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
	}

	ngOnInit(): void {
		this.router.navigate(['', {outlets: {chat: ['search', ""]}}])
	}

}

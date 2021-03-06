import { Route } from '@angular/compiler/src/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { GameService } from 'src/app/game.service';
import { Player, PostGameData, ResolvedPostGame } from 'src/app/postgame.resolver';
import { UserService } from 'src/app/user.service';

export function secondsToDhms(seconds: number) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600*24));
	var h = Math.floor(seconds % (3600*24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	
	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

@Component({
	selector: 'app-post',
	templateUrl: './post.component.html',
	styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
	
	duration: number;
	players: Player[] = [];
	winner: string;
	
	getWinningPlayer() {
		return this.players[0].score > this.players[1].score ? this.players[0].display_name : this.players[1].display_name;
	}
	
	get timeAsString() {
		return secondsToDhms(this.duration);
	}
	
	back() {
		this.router.navigate(['play']);
	}
	
	constructor(
		private readonly route: ActivatedRoute,
		private readonly router: Router
	) {
	}

	ngOnInit(): void {
		const data = this.route.snapshot.data.data;
		this.winner = data.winner;
		this.players = data.players;
		this.winner = this.getWinningPlayer();
		this.duration = data.duration;
	}
}

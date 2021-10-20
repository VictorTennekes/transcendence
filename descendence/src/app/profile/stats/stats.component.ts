import { Route } from '@angular/compiler/src/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { secondsToDhms } from 'src/app/game/post/post.component';
import { UserStats } from '../../user.service';

interface GameDurations {
	total: number,
	shortest: number | null,
	longest: number | null
};

// function roundNumber(num: number, scale: number) {
// 	if(!("" + num).includes("e")) {
// 	  return +(Math.round(num + "e+" + scale)  + "e-" + scale);
// 	} else {
// 	  var arr = ("" + num).split("e");
// 	  var sig = ""
// 	  if(+arr[1] + scale > 0) {
// 		sig = "+";
// 	  }
// 	  return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
// 	}
//   }

@Component({
	selector: 'app-stats',
	templateUrl: './stats.component.html',
	styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
	
	circle: any;
	durations: GameDurations;
	ballHits: number;
	pointsScored: number;
	wins: number;
	losses: number;
	percentage: number;
	
	timeFormattedString(seconds: number | null) {
		if (seconds === null) {
			return '-';
		}
		return (secondsToDhms(seconds));
	}
	
	constructor(
		private readonly route: ActivatedRoute
	) {

	}
	
	get roundedPercentage() {
		return Math.round((this.percentage + Number.EPSILON) * 100) / 100;
	}

	run(angle: number) {
		const radius = 120;
		const circumference = 2 * Math.PI * radius;
		
		const strokeOffset = (1 / 4) * circumference;
		const strokeDasharray = (angle / 360) * circumference;
		
		this.circle.setAttribute('r', radius);
		this.circle.setAttribute('stroke-dasharray', [
			strokeDasharray,
			circumference - strokeDasharray
		]);
		this.circle.setAttribute('stroke-dashoffset', strokeOffset);
	}

	ngOnInit(): void {
		this.circle = document.getElementById('winrate-visual');
		this.route.data.subscribe((data: any) => {
			const stats: UserStats = data.stats;
			this.ballHits = stats.ballHits;
			this.durations = stats.gameDurationInSeconds;
			this.pointsScored = stats.points.won;
			this.wins = stats.games.won;
			this.losses = stats.games.lost;
		});
		if (!this.wins && !this.losses) {
			this.percentage = 0;
			this.run(360);
		}
		else {
			const total = this.wins + this.losses;
			this.percentage = this.wins / total;
			this.run(this.percentage * 360);
			this.percentage *= 100;
		}
	}
}

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

@Component({
	selector: 'app-stats',
	templateUrl: './stats.component.html',
	styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
	
	durations: GameDurations;
	ballHits: number;
	pointsScored: number;
	wins: number;
	losses: number;
	
	timeFormattedString(seconds: number | null) {
		if (seconds === null) {
			return '-';
		}
		return (secondsToDhms(seconds));
	}
	
	constructor(
		private readonly route: ActivatedRoute
	) { }
	
	ngOnInit(): void {
		console.log(`RESOLVED USER STATS: ${JSON.stringify(this.route.snapshot.data.stats)}`);
		this.route.data.subscribe((data: any) => {
			const stats: UserStats = data.stats;
			this.ballHits = stats.ballHits;
			this.durations = stats.gameDurationInSeconds;
			this.pointsScored = stats.points.won;
			this.wins = stats.games.won;
			this.losses = stats.games.lost;
		});
	}
}

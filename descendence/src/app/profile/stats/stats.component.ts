import { Component, OnInit } from '@angular/core';
import { secondsToDhms } from 'src/app/game/post/post.component';

interface GameDurations {
	total: number,
	shortest: number,
	longest: number
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

	timeFormattedString(seconds: number) {
		return (secondsToDhms(seconds));
	}

  constructor() { }

  ngOnInit(): void {
    this.durations = {
			total: 23401,
			shortest: 324,
			longest: 764,
		};
		this.ballHits = 3343;
		this.pointsScored = 890;
		this.wins = 70;
		this.losses = 56;
  }

}

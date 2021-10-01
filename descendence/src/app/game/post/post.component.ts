import { Route } from '@angular/compiler/src/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { GameService } from 'src/app/game.service';
import { UserService } from 'src/app/user.service';

interface Player {
	display_name: string,
	score: number
}

function secondsToDhms(seconds: number) {
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

interface PostGameData {
	id: string,
	duration: number,
	start: Date,
	end: Date,
	data: {
		scores: {[key: string] : number},
		winner: string
	}
};

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


  constructor(
	  private readonly userService: UserService,
	  private readonly gameService: GameService,
	  private readonly route: ActivatedRoute,
  ) {
	  this.gameService.get(this.route.snapshot.params.id).subscribe((game: any) => {
		const data: PostGameData = game;
		this.duration = (data.duration / 1000);
		const playerNames = Object.keys(data.data.scores);
		this.userService.getUserByLogin(playerNames[0]).subscribe((user: any) => {
			this.players.push({
				display_name: user.display_name,
				score: data.data.scores[playerNames[0]]
			});
			this.winner = this.getWinningPlayer();
		});
		this.userService.getUserByLogin(playerNames[1]).subscribe((user: any) => {
			this.players.push({
				display_name: user.display_name,
				score: data.data.scores[playerNames[1]]
			});
			this.winner = this.getWinningPlayer();
			
		});
	  });
  }

  ngOnInit(): void {
	  document.clear();
  }

}

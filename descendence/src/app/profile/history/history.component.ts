import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserEntity, UserService } from 'src/app/user.service';

export interface GameHistory {
	winner: UserEntity;
	opponent: UserEntity;
	duration: number,
	date: Date,
	score: {[key: string] : number};
};

var toHHMMSS = (secs: number) => {
	var sec_num = secs;
	var hours   = Math.floor(sec_num / 3600)
	var minutes = Math.floor(sec_num / 60) % 60
	var seconds = sec_num % 60
	
	return [hours,minutes,seconds]
	.map(v => v < 10 ? "0" + v : v)
	.filter((v,i) => v !== "00" || i > 0)
	.join(":")
}

@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
	
	formatDateAndTime(timestamp: Date, seconds: number) {
		const date = timestamp.toLocaleDateString('en-US');
		return date + " - " + toHHMMSS(seconds);
	}
	
	games: GameHistory[] = [];
	intra_name: string;
	constructor(
		private readonly userService: UserService,
		private readonly route: ActivatedRoute,
		) { }
		
		isWinner(winner: string) {
			return this.intra_name === winner;
		}
		
		ngOnInit(): void {
			this.intra_name = this.route.snapshot.parent?.data.user.intra_name;
			this.games = this.route.snapshot.data.history;
			// const elem1: GameHistory = {
			// 	winner: "Tishj",
			// 	opponent: "Max Theorum",
			// 	duration: 234,
			// 	date: new Date(),
			// 	score: {
			// 		["Max Theorum"]: 3,
			// 		["Tishj"]: 10
			// 	},
			// };
			// const elem2: GameHistory = {
			// 	winner: "Max Theorum",
			// 	opponent: "Tishj",
			// 	duration: 142,
			// 	date: new Date(),
			// 	score: {
			// 		["Max Theorum"]: 10,
			// 		["Tishj"]: 5
			// 	},
			// };
			// this.games.push(elem1);
			console.log(`RESOLVED HISTORY: ${JSON.stringify(this.route.snapshot.data.history)}`);
			// this.games.push(elem2);
			// this.games.push(elem1);
			// this.games.push(elem2);
			// this.games.push(elem1);
			// this.games.push(elem2);
			// this.games.push(elem1);
			// this.games.push(elem2);
			// this.games.push(elem1);
			// this.games.push(elem2);
			// this.games.push(elem1);
			// this.games.push(elem2);
			// this.games.push(elem1);
			// this.games.push(elem2);
		}
	}

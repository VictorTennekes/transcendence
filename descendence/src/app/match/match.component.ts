import { Component, OnInit } from '@angular/core';
import { defaultMatchSettings, MatchService } from '../match.service';
import { QueueService } from '../queue.service';
import { AcceptService } from '../accept.service';
import { MatchSocket } from './match.socket';
import { FormControl, FormGroup } from '@angular/forms';

const timebased = true;
const pointbased = false;

enum BallSpeed {
	NORMAL = "NORMAL",
	FAST = "FAST",
	SANIC = "SANIC"
};

const BallSpeedLabelMapping: Record<BallSpeed, string> = {
    [BallSpeed.NORMAL]: "NORMAL",
    [BallSpeed.FAST]: "FAST",
    [BallSpeed.SANIC]: "SANIC",
};

@Component({
	selector: 'app-match',
	templateUrl: './match.component.html',
	styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {
	
	findgame: FormGroup;
	public speedMappings = BallSpeedLabelMapping;
	public speeds = Object.values(BallSpeed);

	constructor(
		private readonly matchService: MatchService,
		private readonly queueService: QueueService,
		private readonly acceptService: AcceptService,
	) { }
	
	overlay: any;

	get disabled() {
		return this.queueService.findDisabled;
	}

	async findMatch() {
		console.table(JSON.stringify(this.findgame.value));
		return ;
		this.matchService.findMatch(defaultMatchSettings);
		this.overlay = this.queueService.open({hasBackdrop: false});
		//when the
		this.matchService.matchReady().subscribe(() => {
			console.log("RECEIVED READY SIGNAL");
			this.overlay.close();
			this.overlay = this.acceptService.open();
		});
	}
	
	ngOnInit(): void {
		this.findgame = new FormGroup({
			condition: new FormControl(pointbased),
			points: new FormControl(5),
			minutes: new FormControl(3),
			ball_speed: new FormControl(BallSpeedLabelMapping["NORMAL"]),
		});
	}
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { defaultMatchSettings, EndCondition, EndConditionTypes, MatchService, MatchSettings, SpeedMode } from '../match.service';
import { QueueService } from '../queue.service';
import { MatchSocket } from './match.socket';
import { FormControl, FormGroup } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router'
import { MatIcon } from '@angular/material/icon';
import { AcceptComponent } from '../accept/accept.component';
import { MatDialog } from '@angular/material/dialog';
import { threadId } from 'worker_threads';

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
export class MatchComponent implements OnInit, OnDestroy{
	
	findgame: FormGroup;
	public speedMappings = BallSpeedLabelMapping;
	public speeds = Object.values(BallSpeed);

	constructor(
		private readonly matchService: MatchService,
		private readonly queueService: QueueService,
		private router: Router,
		private route: ActivatedRoute,
		public readonly dialog: MatDialog,
		// private readonly routeReuseStrategy: RouteReuseStrategy,
	) {
		// this.routeReuseStrategy.shouldReuseRoute = () => false;
	}
	
	overlay: any;
	private: boolean = false;
	invitedPlayer: string | null = null;
	acceptDialog: any = null;

	get disabled() {
		return this.queueService.findDisabled;
	}

	createMatchSettings(): MatchSettings {
		let settings = defaultMatchSettings;
		const formInput = this.findgame.value;

		if (formInput.condition === pointbased) {
			settings.endCondition.type = EndConditionTypes.POINT;
			settings.endCondition.value = formInput.points;
		}
		else {
			settings.endCondition.type = EndConditionTypes.TIME
			settings.endCondition.value = formInput.minutes
		}
		switch (formInput.ball_speed) {
			case BallSpeedLabelMapping.NORMAL: {
				settings.ballSpeed = SpeedMode.NORMAL
				break ;
			}
			case BallSpeedLabelMapping.FAST: {
				settings.ballSpeed = SpeedMode.FAST
				break ;
			}
			case BallSpeedLabelMapping.SANIC: {
				settings.ballSpeed = SpeedMode.SANIC
				break ;
			}
		}
		return settings;
	}

	async findMatch() {
		//create the match on the server side
		let matchSettings: MatchSettings = this.createMatchSettings();
		const invited_user = this.route.snapshot.params['intra_name'];
		console.log(`FINDMATCH - INVITED USER = ${invited_user}`);
		console.log(`INVITED_USER === '' = ${invited_user === ''}`);
		if (invited_user !== '') {
			matchSettings.opponent_username = invited_user;
		}
		else {
			matchSettings.opponent_username = undefined;
		}
		console.log("FINDMATCH SENT");
		this.matchService.matchReadyListen(invited_user !== '' ? invited_user : null);
		console.log(matchSettings);
		if (invited_user === '') {
			this.queueService.open({hasBackdrop: false});
			this.matchService.findMatch(matchSettings);
		} else {
			this.matchService.inviteUser(matchSettings);
		}
	}

	ngOnInit(): void {

		this.findgame = new FormGroup({
			condition: new FormControl(pointbased),
			points: new FormControl("5"),
			minutes: new FormControl("3"),
			ball_speed: new FormControl(BallSpeedLabelMapping["NORMAL"]),
		}); //TODO: this can exist regardless. Maybe run the person through chat settings anyway?

		this.route.params.subscribe(params => {
			console.log("PARAMS CHANGED");
			this.matchService.errorListener.subscribe((res) => {
				console.log("invite failed");
				console.log(res);
				this.matchService.cancelMatch();
				// this.overlay.close();
				this.queueService.close();
				this.router.navigate(['play']);
				//TODO: report error
			});
			this.private = params['intra_name'] !== '';
			console.log(`PRIVATE VARIABLE = ${this.private}`);
			if (this.private) {
				this.invitedPlayer = (this.route.snapshot.params['intra_name'] as string).toUpperCase();
			}
			else {
				this.invitedPlayer = null;
			}
			console.log("params in match: ", params);
			console.log(params['intra_name']);
			// if (params['intra_name'] !== '') {
			// 	this.findMatch(params['intra_name']);
			// }
		})
	}

	ngOnDestroy(): void {
		this.matchService.unsetReadyListen();
	}
}

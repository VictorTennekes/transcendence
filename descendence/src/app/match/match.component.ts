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
import { UserService } from '../user.service';

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
	currentGame: string | null = null;

	constructor(
		private readonly matchService: MatchService,
		private readonly queueService: QueueService,
		private readonly userService: UserService,
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
		if (invited_user !== '') {
			matchSettings.opponent_username = invited_user;
		}
		else {
			matchSettings.opponent_username = undefined;
		}
		this.matchService.matchReadyListen(invited_user !== '' ? invited_user : null);
		if (invited_user === '') {
			this.queueService.open({hasBackdrop: false});
			this.matchService.findMatch(matchSettings);
		} else {
			this.matchService.inviteUser(matchSettings);
		}
	}

	reconnectToGame(gameId: string) {
		this.matchService.refreshConnection();
		this.router.navigate(['/game', gameId]);
	}

	ngOnInit(): void {

		this.route.data.subscribe((data) => {
			this.currentGame = data.currentGame;
		})

		this.findgame = new FormGroup({
			condition: new FormControl(pointbased),
			points: new FormControl("5"),
			minutes: new FormControl("3"),
			ball_speed: new FormControl(BallSpeedLabelMapping["NORMAL"]),
		}); //TODO: this can exist regardless. Maybe run the person through chat settings anyway?


		this.route.params.subscribe(params => {
			this.matchService.errorListener.subscribe((res) => {
				this.matchService.cancelMatch();
				// this.overlay.close();
				this.queueService.close();
				this.router.navigate(['play']);
				//TODO: report error
			});
			this.private = params['intra_name'] !== '';
			if (this.private) {
				this.invitedPlayer = (this.route.snapshot.params['intra_name'] as string).toUpperCase();
			}
			else {
				this.invitedPlayer = null;
			}
			// if (params['intra_name'] !== '') {
			// 	this.findMatch(params['intra_name']);
			// }
		})
	}

	ngOnDestroy(): void {
		this.matchService.unsetReadyListen();
	}
}

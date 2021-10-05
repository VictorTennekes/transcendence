import { Component, OnInit } from '@angular/core';
import { MatchService, MatchSettings, defaultMatchSettings } from '../match.service';
import { QueueService } from '../queue.service';
import { AcceptService } from '../accept.service';
import { MatchSocket } from './match.socket';
import {ActivatedRoute, Router} from '@angular/router'

@Component({
	selector: 'app-match',
	templateUrl: './match.component.html',
	styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {
	
	constructor(
		private readonly matchService: MatchService,
		private readonly queueService: QueueService,
		private readonly acceptService: AcceptService,
		private router: Router,
		private route: ActivatedRoute
	) { }
	
	overlay: any;

	get disabled() {
		return this.queueService.findDisabled;
	}

	async findMatch() {
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
		
		this.route.params.subscribe(params => {
			this.matchService.receiveGameInviteError().subscribe((res) => {
				console.log("invite failed");
				console.log(res);
				this.matchService.cancelMatch();
				this.overlay.close();
				this.router.navigate(['play']);
				//TODO: report error
			});
			console.log("params in match: ", params);
			console.log(params['intra_name']);
			if (params['intra_name'] !== '') {
				// this.matchService.
				console.log("start match with: ", params['intra_name']);
				let settings = defaultMatchSettings;
				settings.opponent_username =params['intra_name']

				this.matchService.inviteUser(settings);
				this.overlay = this.queueService.open({hasBackdrop: false});
				//when the
				console.log("here man");
				this.matchService.matchReady().subscribe(() => {
					console.log("RECEIVED READY SIGNAL");
					this.overlay.close();
					this.overlay = this.acceptService.open();
				});
			}
		})
		
	}
	
}

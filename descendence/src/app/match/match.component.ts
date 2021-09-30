import { Component, OnInit } from '@angular/core';
import { MatchService } from '../match.service';
import { QueueService } from '../queue.service';
import { AcceptService } from '../accept.service';
import { MatchSocket } from './match.socket';

@Component({
	selector: 'app-match',
	templateUrl: './match.component.html',
	styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {
	
	constructor(
		private readonly matchService: MatchService,
		private readonly queueService: QueueService,
		private readonly acceptService: AcceptService
	) { }
	
	overlay: any;

	get disabled() {
		return this.queueService.findDisabled;
	}

	async findMatch() {
		this.matchService.findMatch({});
		this.overlay = this.queueService.open({hasBackdrop: false});
		//when the
		this.matchService.matchReady().subscribe(() => {
			console.log("RECEIVED READY SIGNAL");
			this.overlay.close();
			this.overlay = this.acceptService.open();
		});
	}
	
	ngOnInit(): void {
	}
	
}

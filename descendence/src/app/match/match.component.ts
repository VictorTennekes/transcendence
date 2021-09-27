import { Component, OnInit } from '@angular/core';
import { MatchService } from '../match.service';
import { QueueService } from '../queue.service';
import { AcceptService } from '../accept.service';
import { Socket } from 'ngx-socket-io';
import { GameSocket } from '../game/game.socket';

@Component({
	selector: 'app-match',
	templateUrl: './match.component.html',
	styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {
	
	constructor(
		private readonly gameSocket: GameSocket,
		private readonly matchService: MatchService,
		private readonly queueService: QueueService,
		private readonly acceptService: AcceptService
	) { }
	
	overlay: any;

	get disabled() {
		return this.queueService.findDisabled;
	}

	async findMatch() {
		//when we receive the match id, we will listen to the event to be notified when the match is ready
		this.gameSocket.fromEvent('found').subscribe((id: any) => {
			console.log(`MATCH ID: ${id}`);
			this.overlay = this.queueService.open({hasBackdrop: false});
			//we'll only get a 'ready' notification once
			this.gameSocket.fromOneTimeEvent(`ready${id}`).then(() => {
				console.log("RECEIVED READY SIGNAL");
				this.overlay.close();
				this.overlay = this.acceptService.open();
			});
		})
	}
	
	ngOnInit(): void {
	}
	
}

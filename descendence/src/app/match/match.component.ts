import { Component, OnInit } from '@angular/core';
import { MatchService } from '../match.service';
import { Socket } from 'ngx-socket-io';
import { QueueService } from '../queue.service';
import { AcceptService } from '../accept.service';

@Component({
	selector: 'app-match',
	templateUrl: './match.component.html',
	styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {
	
	constructor(
		private readonly socket: Socket,
		private readonly matchService: MatchService,
		private readonly queueService: QueueService,
		private readonly acceptService: AcceptService
	) { }
	
	overlay: any;

	async findMatch() {
		//when we receive the match id, we will listen to the event to be notified when the match is ready
		this.matchService.findMatch({}).subscribe((id: string) => {
			console.log(`MATCH ID: ${id}`);
			this.overlay = this.queueService.open({hasBackdrop: false});
			//we'll only get a 'ready' notification once
			this.socket.fromOneTimeEvent(`ready${id}`).then(() => {
				console.log("RECEIVED READY SIGNAL");
				this.overlay.close();
				this.overlay = this.acceptService.open();
			});
		})
	}
	
	ngOnInit(): void {
	}
	
}

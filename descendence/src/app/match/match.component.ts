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

	findMatch() {
		//when we receive the match id, we will listen to the event to be notified when the match is ready
		this.matchService.findMatch({}).subscribe((id: any) => {
			console.log(`MATCH ID: ${id}`);
			this.overlay = this.queueService.open({hasBackdrop: false});
			//we'll only get a 'ready' notification once
			// this.socket.once(id as string, (id: string) => {
				//match is ready
			var interval = setInterval(() => {
				this.overlay.close();
				this.overlay = this.acceptService.open();
				clearInterval(interval);
			}, 2000);
			// });
		})
	}
	
	ngOnInit(): void {
	}
	
}

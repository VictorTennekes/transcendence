import { Component, OnInit } from '@angular/core';
import { MatchService } from '../match.service';
import { Socket } from 'ngx-socket-io';

@Component({
	selector: 'app-match',
	templateUrl: './match.component.html',
	styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {
	
	constructor(
		private readonly socket: Socket,
		private readonly matchService: MatchService
	) { }
	
	findMatch() {
		//when we receive the match id, we will listen to the event to be notified when the match is ready
		this.matchService.findMatch().subscribe((id: string) => {
			this.socket.on(id, (id: string) => {
				//match is ready
				this.socket.emit(id, {});
			});
		})
	}
	
	ngOnInit(): void {
	}
	
}

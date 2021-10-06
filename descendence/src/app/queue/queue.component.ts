import { Time } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatchService } from '../match.service';
import { QueueService } from '../queue.service';

@Component({
	selector: 'app-queue',
	templateUrl: './queue.component.html',
	styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit {
	
	get timeElapsedString() {
		const timeString = new Date(this.queueService.timePassed * 1000).toISOString().substr(11, 8);
		return timeString;
	}

	constructor(
		private readonly queueService: QueueService,
		private readonly matchService: MatchService
	) { }
	
	close() {
		//let the server know the user is no longer searching (delete the corresponding Match)
		this.matchService.cancelMatch();
		this.queueService.close();
		this.queueService.timePassed = 0;
	}

	ngOnInit(): void {
	}
}

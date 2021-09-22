import { Component, OnInit } from '@angular/core';
import { QueueService } from '../queue.service';

@Component({
	selector: 'app-queue',
	templateUrl: './queue.component.html',
	styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit {
	
	constructor(
		private readonly queueService: QueueService
	) { }
	
	close() {
		//let the server know the user is no longer searching (delete the corresponding Match)
		this.queueService.close();
	}

	ngOnInit(): void {

	}
}

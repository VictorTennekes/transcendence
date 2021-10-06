import { Component, OnInit, ViewChild } from '@angular/core';
import { AcceptService } from '../accept.service';
import { CountdownComponent, CountdownConfig } from 'ngx-countdown';
import { MatchService } from '../match.service';
import { Router } from '@angular/router';
import { LoadcircleComponent } from './loadcircle/loadcircle.component';
import { QueueService } from '../queue.service';

@Component({
	selector: 'app-accept',
	templateUrl: './accept.component.html',
	styleUrls: ['./accept.component.scss']
})
export class AcceptComponent implements OnInit {
	
	accepted: boolean = false;

	@ViewChild('cd', { static: false })
	private countdown: CountdownComponent;
	public config: CountdownConfig = {
		leftTime: 3,
		format: 's',
	};

	constructor(
		private readonly router: Router,
		private readonly acceptService: AcceptService,
		private readonly matchService: MatchService,
		private readonly queueService: QueueService
	) { }

	accept() {
		this.matchService.acceptMatch();
		this.accepted = true;
	}

	close() {
		this.acceptService.close();
	}

	ngOnInit(): void {
		this.matchService.matchAccepted().subscribe((match: any) => {
			// console.log(`MATCH ACCEPTED: ${accepted}`);
			this.close();
			if (match.accepted) {
				//both players accepted -> direct to game page
				this.router.navigate(['game/' + match.id]);
			}
			else {
				// did this client accept?
				// if (this.accepted) {
				// 	this.queueService.open({hasBackdrop: false});
				// }
				// else {
				// 	this.queueService.findDisabled = false;
				// 	this.queueService.timePassed = 0;
				// }
				//THIS IS WHERE I LEFT OFF :upside_down:
			}
		});
	}
}

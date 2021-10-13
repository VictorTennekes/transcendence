import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

	decline() {
		// this.matchService.cancelReady();
		console.log("decline");
		this.matchService.decline();
		this.acceptService.close();
	}

	ngOnInit(): void {
		console.log("accept component up")
		this.matchService.matchAccepted().subscribe((match: any) => {
			if (match.accepted) {
				console.log("accepted")
				this.acceptService.close();
				this.router.navigate(['game/' + match.id]);
			}
			else {
				console.log("not accepted")
				this.acceptService.close();
				// did this client accept?
				if (this.accepted) {
					this.queueService.open({hasBackdrop: false});
				}
				else {
					this.queueService.findDisabled = false;
					this.queueService.timePassed = 0;
				}
			}
			this.accepted = false;
		});
	}

	// ngOnDestroy(): void {
	// 	this.matchService.cancelAccept();
	// }
}

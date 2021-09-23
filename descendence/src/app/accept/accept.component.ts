import { Component, OnInit, ViewChild } from '@angular/core';
import { AcceptService } from '../accept.service';
import { CountdownComponent, CountdownConfig } from 'ngx-countdown';
import { MatchService } from '../match.service';

@Component({
	selector: 'app-accept',
	templateUrl: './accept.component.html',
	styleUrls: ['./accept.component.scss']
})
export class AcceptComponent implements OnInit {
	
	@ViewChild('cd', { static: false })
	private countdown: CountdownComponent;
	public config: CountdownConfig = {
		leftTime: 10,
		format: 's',
	};

	constructor(
		private readonly acceptService: AcceptService,
		private readonly matchService: MatchService
	) { }
	
	handleEvent(event: any) {
		if (event["action"] == "done") {
			var interval = setInterval(() => {
				this.matchService.matchAccepted().subscribe((accepted) => {
					if (accepted) {
						//redirect to game page
						console.log("ACCEPTED");
					}
					else {
						console.log("NOT ACCEPTED");
						//bring back to queue
					}
				});
				this.close();
				clearInterval(interval);
			}, 1000);
		}
	}

	accept() {
		this.matchService.acceptMatch();
	}

	close() {
		this.acceptService.close();
	}
	
	ngOnInit(): void {

	}
}

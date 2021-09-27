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
	
	accepted: boolean = false;

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

	accept() {
		this.matchService.acceptMatch().subscribe(() => {
			this.accepted = true;
		});
	}

	close() {
		this.acceptService.close();
	}
	
	ngOnInit(): void {
		this.matchService.matchAccepted().then((accepted) => {
			console.log(`MATCH ACCEPTED: ${accepted}`);
			this.close();
			if (accepted) {
				//both players accepted -> direct to game page
				
			}
			else {
				//did this client accept?
				if (this.accepted) {
					//keep the client in the queue
				}
				else {
					//remove the client from the queue
				}
			}
		});
	}
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { AcceptService } from '../accept.service';
import { CountdownComponent, CountdownConfig } from 'ngx-countdown';
import { MatchService } from '../match.service';
import { Router } from '@angular/router';

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
		private readonly matchService: MatchService
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

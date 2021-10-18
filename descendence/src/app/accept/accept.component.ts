import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CountdownComponent, CountdownConfig } from 'ngx-countdown';
import { MatchService } from '../match.service';
import { Router } from '@angular/router';
import { LoadcircleComponent } from './loadcircle/loadcircle.component';
import { QueueService } from '../queue.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-accept',
	templateUrl: './accept.component.html',
	styleUrls: ['./accept.component.scss']
})
export class AcceptComponent implements OnInit {
	res: {result: boolean, self: boolean, id: string} = {
		result: false,
		self: false,
		id: '',
	};

	@ViewChild('cd', { static: false })
	private countdown: CountdownComponent;
	public config: CountdownConfig = {
		leftTime: 3,
		format: 's',
	};

	constructor(
		// private readonly router: Router,
		private readonly matchService: MatchService,
		private readonly queueService: QueueService,
		private readonly dialogRef: MatDialogRef<AcceptComponent>,
	) { }

	accept() {
		this.matchService.acceptMatch();
		this.res.self = true;
	}

	decline() {
		console.log("decline");
		this.matchService.decline();
		this.dialogRef.close(false);
	}

	ngOnInit(): void {
		console.log("accept component up")

		this.matchService.matchAccepted().subscribe((match: any) => {
			this.res.result = match.accepted;
			this.res.id = match.id;
			this.dialogRef.close(this.res);
				// // did this client accept?
				// if (this.res.self) {
				// 	this.queueService.open({hasBackdrop: false});
				// }
				// else {
				// 	this.queueService.findDisabled = false;
				// 	this.queueService.timePassed = 0;
				// }
			// }
		});
	}
}

import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { runInThisContext } from 'vm';
import { ClientService } from '../client.service';
import { Game } from '../game.script';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit, AfterViewInit {
	game: Game;
	constructor(
		private readonly route: ActivatedRoute,
		private readonly client: ClientService,
		private readonly router: Router
	) { }
	
	ngOnInit(): void {
	}
	
	// gameLoop() {
	// 	this.game.update();
	// 	this.game.draw();
	// 	requestAnimationFrame(() => this.gameLoop());
	// 	this.client.requestGameData();
	// }

	@HostListener('window:keyup', ['$event'])
	listenRelease(event: KeyboardEvent) {
		const keyString = event.key;
		switch (keyString) {
			case 'ArrowUp': {
				this.client.releaseUp();
				break ;
			}
			case 'ArrowDown': {
				this.client.releaseDown();
				break;
			}
		}
	}
	@HostListener('window:keydown', ['$event'])
	listenPress(event: KeyboardEvent) {
		const keyString = event.key;
		switch (keyString) {
			case 'ArrowUp': {
				this.client.pressUp();
				break ;
			}
			case 'ArrowDown': {
				this.client.pressDown();
				break;
			}
		}
	}

	ngAfterViewInit() {
		const gameCanvas = <HTMLCanvasElement>document.getElementById('game-canvas');
		const scoreCanvas = <HTMLCanvasElement>document.getElementById('score-canvas');
		this.game = new Game(gameCanvas, scoreCanvas, this.client);
		const gameID = this.route.snapshot.params.id;
		this.client.join(gameID);
		this.client.gameFinished().subscribe(() => {
			console.log("GAME FINISHED");
			//NAVIGATE ONLY WHEN THE GAME IS SAVED TO THE DATABASE
			this.router.navigate(['post/' + gameID]);
		});
		this.client.receiveGameData().subscribe((data) => {
			console.log(JSON.stringify(data));
			this.game.updateFromData(data);
			this.game.draw();
//			requestAnimationFrame(() => {return ;});
		});
	}
}

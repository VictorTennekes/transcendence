import { AfterViewInit, Component, OnInit } from '@angular/core';
import { request } from 'http';
import { Game } from '../game.script';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit, AfterViewInit {
	game: Game;
	constructor() { }
	
	ngOnInit(): void {
	}

	gameLoop() {
		this.game.update();
		this.game.draw();
		requestAnimationFrame(() => this.gameLoop());
	}

	ngAfterViewInit() {
		const canvas = <HTMLCanvasElement>document.getElementById('game-canvas');
		this.game = new Game(canvas);
		this.gameLoop();
	}
}

import { ClientService } from "./client.service";
import { SequenceEqualOperator } from 'rxjs/internal/operators/sequenceEqual';

const PADDLE_WIDTH = 23;
const PADDLE_HEIGHT = 160;
const BALL_SIZE = 15;
const BALL_SPEED = 10;
const WALL_OFFSET = 40;

enum KeyBindings {
	UP,
	DOWN
}

interface Coordinate {
	x: number,
	y: number
}

export class Game {
	private gameContext: CanvasRenderingContext2D;
	private players: {[id: string] : Player} = {};
	private ball: Ball = new Ball();

	// static setKeyPressed(playerString: string, keyString: string, state: boolean) {
	// 	if (keyString !== 'ArrowUp' && keyString !== 'ArrowDown') {
	// 		return ;
	// 	}
	// 	const key: KeyBindings = (keyString === 'ArrowUp') ? KeyBindings.UP : KeyBindings.DOWN;
	// 	this.players[playerString].keysPressed[key] = state;
	// }

	constructor(
		private gameCanvas: HTMLCanvasElement,
		private readonly client: ClientService
	) {
		const context = this.gameCanvas.getContext("2d");
		if (context) {
			this.gameContext = context;
		}
		else return ;
		this.gameContext.font = "30px Orbitron";
	}

	drawScore() {
		this.gameContext.strokeStyle = "#fff";
		this.gameContext.lineWidth = 5;
		this.gameContext.fillStyle = "#fff";
//		this.gameContext.strokeRect(10,10,this.gameCanvas.width - 20 ,this.gameCanvas.height - 20);

		const keys = Object.keys(this.players);
		this.gameContext.fillText(this.players[keys[0]].score.toString(), (this.gameCanvas.width / 2) - 80, 50);
		this.gameContext.fillText(this.players[keys[1]].score.toString(), (this.gameCanvas.width / 2) + 80, 50);
	}
	drawBoardDetails() {
		//draw court outline
		this.gameContext.strokeStyle = "#fff";
		this.gameContext.lineWidth = 5;
		this.gameContext.strokeRect(10,10,this.gameCanvas.width - 20 ,this.gameCanvas.height - 20);
		//draw center lines
		for (var i = 0; i + 30 < this.gameCanvas.height; i += 30) {
			this.gameContext.fillStyle = "#fff";
			this.gameContext.fillRect(this.gameCanvas.width / 2 - 10, i + 10, 15, 20);
		}
		
		//draw scores
		this.drawScore();
	}

	updateFromData(data: any) {
		for (const key in this.players) {
			if (!this.players[key]) {
				this.players[key] = new Player();
			}
			this.players[key].updateFromData(data.players[key]);
		}
		this.ball.position = data.ball.position;
//		this.ball.update(Game.players['one'].paddle, Game.players['two'].paddle, this.gameCanvas);
	}

	draw() {
		this.gameContext.fillStyle = "#000";
		this.gameContext.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		
//		this.drawBoardDetails();
		this.drawScore();
		for (const key in this.players) {
			this.players[key].paddle.draw(this.gameContext);
		}
		this.ball.draw(this.gameContext);
	}
}

class Entity {
	width:number;
	height:number;
	position: Coordinate;
	velocity: Coordinate;
	constructor() {
		this.width = 1;
		this.height = 1;
		this.position = {x: 1,y: 1};
		this.velocity = {x: 1,y: 1};
	}
	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = "#fff";
		context.fillRect(this.position.x,this.position.y,this.width,this.height);
	}
}

class Player {
	paddle: Paddle;
	keysPressed: boolean[] = [];

	score: number;

	constructor() {
		this.score = 1;
		this.paddle = new Paddle();
	}
	updateFromData(data: any) {
		this.paddle.position = data.paddle.position;
		this.score = data.score;
	}
}

class Paddle extends Entity {
	
	private speed:number = 10;
	
	constructor() {
		super();
	}
	drawSide(context: CanvasRenderingContext2D, y: number) {
		context.fillStyle = "#fff";
		context.beginPath();
		context.arc(this.position.x + (this.width / 2), y, this.width / 2, 0, 2 * Math.PI);
		context.fill();
	}

	draw(context: CanvasRenderingContext2D) {
		super.draw(context);
		this.drawSide(context, this.position.y);
		this.drawSide(context, this.position.y + this.height);
	}
}

class Ball extends Entity {
	
	private speed:number = BALL_SPEED;
	
	constructor() {
		super();

		var randomDirection = Math.floor(Math.random() * 2) + 1;
		if (randomDirection % 2) {
			this.velocity.x = 1;
		} else {
			this.velocity.x = -1;
		}
		this.velocity.y = 1;
	}

	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = "#fff";
		context.beginPath();
		context.arc(this.position.x,this.position.y, this.width, 0, 2 * Math.PI);
		context.fill();
	}
}

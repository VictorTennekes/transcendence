import { ClientService } from "./client.service";

const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 60;
const BALL_SIZE = 10;
const BALL_SPEED = 10;
const WALL_OFFSET = 20;

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
	private ball: Ball;

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

		//initializing objects
		this.players['one'] = new Player(WALL_OFFSET,this.gameCanvas.height / 2 - PADDLE_HEIGHT / 2);
		this.players['two'] = new Player(this.gameCanvas.width - (WALL_OFFSET + PADDLE_WIDTH), this.gameCanvas.height / 2 - PADDLE_HEIGHT / 2);
		this.ball = new Ball(this.gameCanvas.width / 2 - BALL_SIZE / 2, this.gameCanvas.height / 2 - BALL_SIZE / 2);
	}

	drawScore() {
		this.gameContext.strokeStyle = "#fff";
		this.gameContext.lineWidth = 5;
		this.gameContext.fillStyle = "#fff";
//		this.gameContext.strokeRect(10,10,this.gameCanvas.width - 20 ,this.gameCanvas.height - 20);

		this.gameContext.fillText(this.players['one'].score.toString(), 280, 50);
		this.gameContext.fillText(this.players['two'].score.toString(), 390, 50);
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
		this.players['one'].updateFromData(data.players['one']);
		this.players['two'].updateFromData(data.players['two']);
		this.ball.position = data.ball.position;
//		this.ball.update(Game.players['one'].paddle, Game.players['two'].paddle, this.gameCanvas);
	}

	draw() {
		this.gameContext.fillStyle = "#000";
		this.gameContext.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		
//		this.drawBoardDetails();
		this.drawScore();
		this.players['one'].paddle.draw(this.gameContext);
		this.players['two'].paddle.draw(this.gameContext);
		this.ball.draw(this.gameContext);
	}
}

class Entity {
	width:number;
	height:number;
	position: Coordinate;
	velocity: Coordinate;
	constructor(w:number,h:number,x:number,y:number) {
		this.width = w;
		this.height = h;
		this.position = {
			x,
			y
		};
		this.velocity = {
			x: 0,
			y: 0,
		};
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

	constructor(x:number,y:number) {
		this.score = 0;
		this.paddle = new Paddle(x,y);
	}
	updateFromData(data: any) {
		this.paddle.position = data.paddle.position;
		this.score = data.score;
	}
}

class Paddle extends Entity {
	
	private speed:number = 10;
	
	constructor(x:number,y:number) {
		super(PADDLE_WIDTH,PADDLE_HEIGHT,x,y);
	}
}

class Ball extends Entity {
	
	private speed:number = BALL_SPEED;
	
	constructor(x:number,y:number) {
		super(BALL_SIZE,BALL_SIZE,x,y);

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
//		context.fillRect(this.position.x,this.position.y,this.width,this.height);
		context.beginPath();
		context.arc(this.position.x,this.position.y, this.width, 0, 2 * Math.PI);
		context.fill();
	}
}

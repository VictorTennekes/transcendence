import { ClientService } from "./client.service";

const PADDLE_WIDTH = 22;
const PADDLE_HEIGHT = 150;
const BALL_SIZE = 15;
const BALL_SPEED = 10;
const WALL_OFFSET = 40;

interface GameData {
	ball: Ball,
	players: {[id: string] : Player},
	users: {
		one: User,
		two: User
	}
}

enum KeyBindings {
	UP,
	DOWN
}

interface Coordinate {
	x: number,
	y: number
}

interface User {
	login: string,
	display_name: string,
	id: string
};

export class Game {
	private _users: {
		one: User,
		two: User
	};
	private gameContext: CanvasRenderingContext2D;
	private scoreContext: CanvasRenderingContext2D;
	private players: {[id: string] : Player} = {};
	private timePassed: number = 0;
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
		private scoreCanvas: HTMLCanvasElement,
		private readonly client: ClientService
	) {
		const context = this.gameCanvas.getContext("2d");
		if (context) {
			this.gameContext = context;
		}
		const context2 = this.scoreCanvas.getContext("2d");
		if (context2) {
			this.scoreContext = context2;
		}
		this.ball = new Ball(this.gameCanvas.width / 2 - BALL_SIZE / 2, this.gameCanvas.height / 2 - BALL_SIZE / 2);
	}
	
	drawDebugData() {
		this.gameContext.strokeStyle = "#fff";
		this.gameContext.lineWidth = 10;
		this.gameContext.fillStyle = "#fff";
		this.scoreContext.font = "2rem Biryani, bold";
		this.scoreContext.fillText(this.players[this._users.one.login].hits.toString(), (this.gameCanvas.width / 2) + 40, this.gameCanvas.height - 70);
		this.scoreContext.fillText(this.players[this._users.two.login].hits.toString(), (this.gameCanvas.width / 2) + 70 ,this.gameCanvas.height - 70);
	}
	drawTime() {
		this.gameContext.strokeStyle = "#89AFBB";
		this.gameContext.lineWidth = 10;
		this.gameContext.fillStyle = "#89AFBB";
		//		this.gameContext.strokeRect(10,10,this.gameCanvas.width - 20 ,this.gameCanvas.height - 20);
		
		this.gameContext.font = "2rem Poppins, bold";
		const timeString = new Date(this.timePassed * 1000).toISOString().substr(11, 8);
		this.gameContext.fillText(timeString, this.gameCanvas.width / 2, this.gameCanvas.height - 30);
	}

	drawScore() {
		this.scoreContext.clearRect(0, 0, this.scoreCanvas.width, this.scoreCanvas.height);
		this.scoreContext.strokeStyle = "#fff";
		this.scoreContext.lineWidth = 10;
		this.scoreContext.fillStyle = "#fff";
		//		this.gameContext.strokeRect(10,10,this.gameCanvas.width - 20 ,this.gameCanvas.height - 20);
		
		this.scoreContext.font = "2rem Biryani, bold";
		this.scoreContext.fillText(this._users.one.display_name, (this.scoreCanvas.width / 4), (this.scoreCanvas.height / 4) * 3);
		this.scoreContext.fillText(this._users.two.display_name, (this.scoreCanvas.width / 4) * 3, (this.scoreCanvas.height / 4) * 3);
		
		this.scoreContext.font = "3.4rem Biryani, bold";
		this.scoreContext.fillText(this.players[this._users.two.login].score.toString(), (this.scoreCanvas.width / 2) + 40, (this.scoreCanvas.height / 4) * 3);
		this.scoreContext.fillText(this.players[this._users.one.login].score.toString(), (this.scoreCanvas.width / 2) - 70, (this.scoreCanvas.height / 4) * 3);
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
		if (!this._users) {
			this._users = data.users;
			this.players[this._users.one.login] = new Player(WALL_OFFSET,this.gameCanvas.height / 2 - PADDLE_HEIGHT / 2);
			this.players[this._users.two.login] = new Player(WALL_OFFSET,this.gameCanvas.height / 2 - PADDLE_HEIGHT / 2);
		}
		this._users = data.users;
		//update player one
		this.players[this._users.one.login].updateFromData(data.players[data.users.one.id]);

		//update player two
		this.players[this._users.two.login].updateFromData(data.players[data.users.two.id]);
		this.ball.position = data.ball.position;
		this.timePassed = data.secondsPassed;
	}

	draw() {
		this.gameContext.fillStyle = "#D2E4E9";
		this.gameContext.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		
		this.drawTime();
//		this.drawBoardDetails();
		this.drawScore();
		// this.drawDebugData();
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
	color: string;
	constructor(w:number,h:number,x:number,y:number,color:string) {
		this.width = w;
		this.height = h;
		this.position = {
			x,
			y
		};
		this.color = color;
		this.velocity = {
			x: 0,
			y: 0,
		};
	}
	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = this.color;
		context.fillRect(this.position.x,this.position.y,this.width,this.height);
	}
}

class Player {
	paddle: Paddle;
	keysPressed: boolean[] = [];
	hits: number = 0;
	score: number = 0;

	constructor(x:number,y:number) {
		this.paddle = new Paddle(x,y);
	}
	updateFromData(data: any) {
		this.paddle.position = data.paddle.position;
		this.score = data.score;
		this.hits = data.hits;
	}
}

class Paddle extends Entity {
	
	private speed:number = 10;
	
	constructor(x:number,y:number) {
		super(PADDLE_WIDTH,PADDLE_HEIGHT,x,y, '#213D5D');
	}
	drawSide(context: CanvasRenderingContext2D, y: number) {
		context.fillStyle = this.color;
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
	
	constructor(x: number, y: number) {
		super(BALL_SIZE,BALL_SIZE,x,y, '#50E5EF');

		var randomDirection = Math.floor(Math.random() * 2) + 1;
		if (randomDirection % 2) {
			this.velocity.x = 1;
		} else {
			this.velocity.x = -1;
		}
		this.velocity.y = 1;
	}

	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(this.position.x,this.position.y, this.width, 0, 2 * Math.PI);
		context.fill();
	}
}

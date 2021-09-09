import { ClientService } from "./client.service";

enum KeyBindings {
	UP,
	DOWN
}

export class Game {
	private gameContext: CanvasRenderingContext2D;
	public static players: {[id: string] : Player} = {};
	private ball: Ball;

	static setKeyPressed(player: Player, keyString: string, state: boolean) {
		if (keyString !== 'ArrowUp' && keyString !== 'ArrowDown') {
			return ;
		}
		console.log(keyString);
		const key: KeyBindings = (keyString === 'ArrowUp') ? KeyBindings.UP : KeyBindings.DOWN;
		player.keysPressed[key] = state;
	}

	constructor(
		private gameCanvas: HTMLCanvasElement,
		private readonly client: ClientService
	) {
//		console.log(`${JSON.stringify(this.gameCanvas)}`);
		const context = this.gameCanvas.getContext("2d");
		if (context) {
			this.gameContext = context;
		} else {
			return ;
		}
		this.gameContext.font = "30px Orbitron";
		
		window.addEventListener("keydown",function(e) {
			Game.setKeyPressed(Game.players['one'], e.key, true);
		});
		
		window.addEventListener("keyup",function(e: KeyboardEvent) {
			Game.setKeyPressed(Game.players['one'], e.key, false);
		});

		
		var paddleWidth:number = 20, paddleHeight:number = 60, ballSize:number = 10, wallOffset:number = 20;
		Game.players['one'] = new Player(paddleWidth,paddleHeight,wallOffset,this.gameCanvas.height / 2 - paddleHeight / 2);
		Game.players['two'] = new Player(paddleWidth,paddleHeight,this.gameCanvas.width - (wallOffset + paddleWidth) ,this.gameCanvas.height / 2 - paddleHeight / 2);
		
		this.ball = new Ball(ballSize,ballSize,this.gameCanvas.width / 2 - ballSize / 2, this.gameCanvas.height / 2 - ballSize / 2);
		
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
		this.gameContext.fillText(Game.players['one'].score.toString(), 280, 50);
		this.gameContext.fillText(Game.players['two'].score.toString(), 390, 50);
	}

	update() {
		Game.players['one'].update(this.gameCanvas);
		Game.players['two'].update(this.gameCanvas);
		this.ball.update(Game.players['one'].paddle, Game.players['two'].paddle, this.gameCanvas);
	}

	draw() {
		this.gameContext.fillStyle = "#000";
		this.gameContext.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		
		this.drawBoardDetails();
		Game.players['one'].paddle.draw(this.gameContext);
		Game.players['two'].paddle.draw(this.gameContext);
		this.ball.draw(this.gameContext);
	}
}

class Entity {
	width:number;
	height:number;
	x:number;
	y:number;
	xVel:number = 0;
	yVel:number = 0;
	constructor(w:number,h:number,x:number,y:number) {
		this.width = w;
		this.height = h;
		this.x = x;
		this.y = y;
	}
	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = "#fff";
		context.fillRect(this.x,this.y,this.width,this.height);
	}
}

class Player {
	paddle: Paddle;
	keysPressed: boolean[] = [];

	score: number;

	constructor(w:number,h:number,x:number,y:number) {
		this.score = 0;
		this.paddle = new Paddle(w,h,x,y);
	}
	update(canvas: HTMLCanvasElement) {
		this.paddle.update(canvas, this.keysPressed);
	}
}

class Paddle extends Entity {
	
	private speed:number = 10;
	
	constructor(w:number,h:number,x:number,y:number) {
		super(w,h,x,y);
	}
	
	update(canvas: HTMLCanvasElement, keysPressed: boolean[]) {
		if ( keysPressed[KeyBindings.UP] ) {
			this.yVel = -1;
			if (this.y <= 20) {
				this.yVel = 0
			}
		} else if (keysPressed[KeyBindings.DOWN]) {
			this.yVel = 1;
			if (this.y + this.height >= canvas.height - 20) {
				this.yVel = 0;
			}
		} else {
			this.yVel = 0;
		}
		this.y += this.yVel * this.speed;
	}
}

class Ball extends Entity {
	
	private speed:number = 5;
	
	constructor(w:number,h:number,x:number,y:number) {
		super(w,h,x,y);
		var randomDirection = Math.floor(Math.random() * 2) + 1;
		if (randomDirection % 2) {
			this.xVel = 1;
		} else {
			this.xVel = -1;
		}
		this.yVel = 1;
	}
	
	update(playerOne:Paddle, playerTwo:Paddle, canvas: HTMLCanvasElement) {
		
		//check top canvas bounds
		if (this.y <= 10) {
			this.yVel = 1;
		}
		
		//check bottom canvas bounds
		if (this.y + this.height >= canvas.height - 10) {
			this.yVel = -1;
		}
		
		//check left canvas bounds
		if (this.x <= 0) {
			this.x = canvas.width / 2 - this.width / 2;
			Game.players['two'].score += 1;
		}
		
		//check right canvas bounds
		if (this.x + this.width >= canvas.width) {
			this.x = canvas.width / 2 - this.width / 2;
			Game.players['one'].score += 1;
		}
		
		
		//check player collision
		if (this.x <= playerOne.x + playerOne.width) {
			if (this.y >= playerOne.y && this.y + this.height <= playerOne.y + playerOne.height) {
				this.xVel = 1;
			}
		}
		
		//check computer collision
		if (this.x + this.width >= playerTwo.x) {
			if (this.y >= playerTwo.y && this.y + this.height <= playerTwo.y + playerTwo.height) {
				this.xVel = -1;
			}
		}
		
		this.x += this.xVel * this.speed;
		this.y += this.yVel * this.speed;
	}
}

const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 60;
const BALL_SIZE = 10;
const BALL_SPEED = 5;
const WALL_OFFSET = 20;

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 400;

enum KeyBindings {
	UP,
	DOWN
}

interface Coordinate {
	x: number,
	y: number
}

interface Canvas {
	width: number,
	height: number
};

interface GameData {
	ball: Ball,
	players: {[id: string] : Player},
}

export class Game {
	public static canvas: Canvas = {
		width: CANVAS_WIDTH,
		height: CANVAS_HEIGHT
	};
	private players: {[id: string] : Player} = {};
	private ball: Ball;

	setKeyPressed(player: string, keyString: string, state: boolean) {
		if (keyString !== 'ArrowUp' && keyString !== 'ArrowDown') {
			return ;
		}
		const key: KeyBindings = (keyString === 'ArrowUp') ? KeyBindings.UP : KeyBindings.DOWN;
		this.players[player].keysPressed[key] = state;
	}

	constructor(
	) {
		//initializing objects
		this.players['one'] = new Player(WALL_OFFSET,Game.canvas.height / 2 - PADDLE_HEIGHT / 2);
		this.players['two'] = new Player(Game.canvas.width - (WALL_OFFSET + PADDLE_WIDTH), Game.canvas.height / 2 - PADDLE_HEIGHT / 2);
		this.ball = new Ball(Game.canvas.width / 2 - BALL_SIZE / 2, Game.canvas.height / 2 - BALL_SIZE / 2);
	}

	get data(): GameData {
		return {
			ball: this.ball,
			players: this.players
		};
	}

	update() {
		this.players['one'].update(Game.canvas);
		this.players['two'].update(Game.canvas);
		this.ball.update(this.players['one'], this.players['two'], Game.canvas);
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
}

class Player {
	paddle: Paddle;
	keysPressed: boolean[] = [];

	score: number;

	constructor(x:number,y:number) {
		this.score = 0;
		this.paddle = new Paddle(x,y);
	}
	update(canvas: Canvas) {
		this.paddle.update(canvas, this.keysPressed);
	}
}

class Paddle extends Entity {
	
	private speed:number = 10;
	
	constructor(x:number,y:number) {
		super(PADDLE_WIDTH,PADDLE_HEIGHT,x,y);
	}
	
	update(canvas: Canvas, keysPressed: boolean[]) {
		if ( keysPressed[KeyBindings.UP] ) {
			this.velocity.y = -1;
			if (this.position.y <= WALL_OFFSET) {
				this.velocity.y = 0
			}
		}
		else if (keysPressed[KeyBindings.DOWN]) {
			this.velocity.y = 1;
			if (this.position.y + this.height >= canvas.height - this.width) {
				this.velocity.y = 0;
			}
		}
		else {
			this.velocity.y = 0;
		}
		this.position.y += this.velocity.y * this.speed;
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

	update(playerOne:Player, playerTwo: Player, canvas: Canvas) {
		
		//check top canvas bounds
		if (this.position.y <= BALL_SIZE) {
			this.velocity.y = 1;
		}
		
		//check bottom canvas bounds
		if (this.position.y + this.height >= canvas.height - BALL_SIZE) {
			this.velocity.y = -1;
		}

		//check left canvas bounds
		if (this.position.x <= 0) {
			this.position.x = canvas.width / 2 - this.width / 2;
			this.velocity.x = 1;
			playerTwo.score += 1;
		}
		
		//check right canvas bounds
		if (this.position.x + this.width >= canvas.width) {
			this.position.x = canvas.width / 2 - this.width / 2;
			this.velocity.x = -1;
			playerOne.score += 1;
		}
		
		//check player collision
		if (this.position.x <= playerOne.paddle.position.x + playerOne.paddle.width) {
			if (this.position.y >= playerOne.paddle.position.y && this.position.y + this.height <= playerOne.paddle.position.y + playerOne.paddle.height) {
				this.velocity.x = 1;
			}
		}
		
		//check computer collision
		if (this.position.x + this.width >= playerTwo.paddle.position.x) {
			if (this.position.y >= playerTwo.paddle.position.y && this.position.y + this.height <= playerTwo.paddle.position.y + playerTwo.paddle.height) {
				this.velocity.x = -1;
			}
		}
		
		this.position.x += this.velocity.x * this.speed;
		this.position.y += this.velocity.y * this.speed;
	}
}
import { Logger } from "@nestjs/common";
import { match } from "assert";
import { EndCondition, EndConditionTypes, Match } from "src/match/match.class";

const PADDLE_WIDTH = 25;
const PADDLE_HEIGHT = 150;
const BALL_SIZE = 15;
const BALL_SPEED = 5;
const WALL_OFFSET = 40;

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 750;

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

export interface User {
	login: string;
	display_name: string;
	id: string; //socket.id
}

interface GameData {
	ball: Ball,
	players: {[id: string] : Player},
	users: {
		one: User,
		two: User
	},
	secondsPassed: number
}

export class Game {
	public static canvas: Canvas = {
		width: CANVAS_WIDTH,
		height: CANVAS_HEIGHT
	};
	private _users: {
		one: User,
		two: User,
	};
	private players: {[id: string] : Player} = {};
	private ball: Ball;

	private goal: EndCondition;
	setKeyPressed(player: string, keyString: string, state: boolean) {
		if (keyString !== 'ArrowUp' && keyString !== 'ArrowDown') {
			return ;
		}
		const key: KeyBindings = (keyString === 'ArrowUp') ? KeyBindings.UP : KeyBindings.DOWN;
		this.players[player].keysPressed[key] = state;
	}
	startTime: Date;

	constructor(
		match: Match
	) {
		this._users = {
			one: match.creator,
			two: match.opponent
		};
		this.goal = match.settings.endCondition;
		this.startTime = new Date();
		//initializing objects
		this.players[match.creator.id] = new Player(WALL_OFFSET,Game.canvas.height / 2 - PADDLE_HEIGHT / 2);
		this.players[match.opponent.id] = new Player(Game.canvas.width - (WALL_OFFSET + PADDLE_WIDTH), Game.canvas.height / 2 - PADDLE_HEIGHT / 2);
		this.ball = new Ball(Game.canvas.width / 2 - BALL_SIZE / 2, Game.canvas.height / 2 - BALL_SIZE / 2);
	}

	get users() {
		return ({
			one: this._users.one,
			two: this._users.two,
		});
	}

	get winner() {
		if (!this.goalReached)
			return (null);
		return this.players[this._users.one.id].score > this.players[this._users.two.id].score ? this._users.one.login : this._users.two.login;
	}

	get scores(): {[key: string] : number} {
		let scores: {[key: string] : number} = {};
		scores[this._users.one.login] = this.players[this._users.one.id].score;
		scores[this._users.two.login] = this.players[this._users.two.id].score;
		return (scores);
	}
	get timeElapsed() {
		const now = new Date();
		const duration = now.valueOf() - this.startTime.valueOf();
		return duration;
	}
	get data(): GameData {
		return {
			ball: this.ball,
			players: this.players,
			users: this._users,
			secondsPassed: this.timeElapsed / 1000,
		};
	}

	get goalReached() {
		if (this.goal.type == EndConditionTypes.POINT) {
			// Logger.log("REACHED");
			return this.players[this._users.one.id].score == this.goal.value || this.players[this._users.two.id].score == this.goal.value;
		}
		else {
			const scoreTied: boolean = (this.players[this._users.one.id].score == this.players[this._users.two.id].score);
			if (scoreTied)
				return (false);
			const duration = this.timeElapsed;
			return (duration && (duration / 1000) / 60 >= this.goal.value);
		}
	}

	update() {
		for (const player in this.players) {
			this.players[player].update(Game.canvas);
		}
		this.ball.update(this.players[this.users.one.id], this.players[this.users.two.id], Game.canvas);
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
			if (this.position.y <= BALL_SIZE) {
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
		
		const COLLISION_RADIUS = playerOne.paddle.width + (this.width / 2);

		//check player collision
		//check if X position is colliding with the player's X position
		const playerOnePositionDifference = this.position.x - playerOne.paddle.position.x;
		// if ((this.position.x - this.width / 2) <= playerOne.paddle.position.x + playerOne.paddle.width)
		if (playerOnePositionDifference <= COLLISION_RADIUS && playerOnePositionDifference >= -COLLISION_RADIUS)
		{
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

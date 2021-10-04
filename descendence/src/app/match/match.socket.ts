import { Socket } from "ngx-socket-io";

export class MatchSocket extends Socket {
	constructor() {
		super({
			url: 'http://localhost:3000/match',
			options: {
				transports: ['websocket']
			}
		});
	}
}

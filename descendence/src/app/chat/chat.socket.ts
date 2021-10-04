import { Socket } from "ngx-socket-io";

export class ChatSocket extends Socket {
	constructor() {
	super({
		url: 'http://localhost:3000/chat',
		options: {
			transports: ['websocket']
		}
	});
	}
}

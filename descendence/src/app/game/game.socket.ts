import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";

@Injectable()
export class GameSocket extends Socket {
  constructor() {
    super({
		url: 'http://localhost:3000',
		options: {
			path: 'game'
		},
	});
  }
}

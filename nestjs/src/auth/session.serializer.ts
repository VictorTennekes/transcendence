import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";

@Injectable()
export class SessionSerializer extends PassportSerializer
{
	constructor() {
		super();
	}

	serializeUser(user: any, done: (err: any, id?: any) => void): void {
		console.log("Serializing");
		done(null, user);
	}

	deserializeUser(payload: any, done: (err: any, id?: any) => void): void {
		console.log("Deserializing");
		done(null, payload);
	}
}

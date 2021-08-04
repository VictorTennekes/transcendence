import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";

//SerializeUser is called by AuthGuard(Strategy).logIn(request)
//DeserializeUser is called on every request
@Injectable()
export class SessionSerializer extends PassportSerializer
{
	constructor() {
		super();
	}

	serializeUser(user: any, done: (err: any, id?: any) => void): void {
		console.log(`Serializing: ${JSON.stringify(user)}`);
		done(null, user);
	}

	deserializeUser(payload: any, done: (err: any, id?: any) => void): void {
		console.log(`Deserializing: ${JSON.stringify(payload)}`);
		done(null, payload);
	}
}

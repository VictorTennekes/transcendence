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
		//store only the intra_name;
		console.log(`Serializing: ${JSON.stringify(user)}`);
		done(null, user);
	}

	deserializeUser(payload: any, done: (err: any, id?: any) => void): void {
		//fetch the user from the database, using the intra_name;
		console.log(`Deserializing: ${JSON.stringify(payload)}`);
		done(null, payload);
	}
}

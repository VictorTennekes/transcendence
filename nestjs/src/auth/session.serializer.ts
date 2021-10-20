import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { UserService } from "@user/user.service";

//SerializeUser is called by AuthGuard(Strategy).logIn(request)
//DeserializeUser is called on every request
@Injectable()
export class SessionSerializer extends PassportSerializer
{
	constructor(
		private readonly userService: UserService
	) {
		super();
	}

	async serializeUser(user: any, done: (err: any, id?: any) => void){
		//store only the intra_name;
		const sessionData = {
			login: user.intra_name,
		};
		done(null, sessionData);
	}

	async deserializeUser(payload: any, done: (err: any, id?: any) => void) {
		//fetch the user from the database, using the intra_name;
		// console.log(`Deserializing: ${JSON.stringify(payload)}`);
		const user = await this.userService.findOne(payload.login);
		// console.log(`Deserializing: ${JSON.stringify(user)}`);
		done(null, user);
	}
}

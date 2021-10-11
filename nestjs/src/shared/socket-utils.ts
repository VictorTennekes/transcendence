import { Injectable } from '@nestjs/common';
import { Socket } from "socket.io";
import { UserDTO } from "@user/dto/user.dto";
import { parse } from "cookie";
import { UserService } from "@user/user.service";


@Injectable()
export class SessionDB {

	constructor(public db) {
		const postgresConnection = 
		{
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			host: process.env.POSTGRES_HOST,
			port: process.env.POSTGRES_PORT,
			database: process.env.POSTGRES_DB
		};
				
		db = require('knex')({
			client: 'pg',
			connection: postgresConnection,
		});
	}

	public async getUserFromSocket(socket: Socket, userService: UserService): Promise<UserDTO> {
		// const postgresConnection = 
		// {
		// 	user: process.env.POSTGRES_USER,
		// 	password: process.env.POSTGRES_PASSWORD,
		// 	host: process.env.POSTGRES_HOST,
		// 	port: process.env.POSTGRES_PORT,
		// 	database: process.env.POSTGRES_DB
		// };
				
		// const db = require('knex')({
		// 	client: 'pg',
		// 	connection: postgresConnection,
		// });





		const cookie = socket.handshake.headers.cookie;
		if (!cookie) return null;
		const parsedCookie = parse(cookie);
		const cookieData = parsedCookie['connect.sid'];

		let sid = cookieData.substr(2, cookieData.indexOf(".") - 2);

		const otherRes = await this.db("session").where("sid", sid);
		// const otherRes = await db("session").where("sid", sid);
		if (!otherRes) return null;
		if (!otherRes[0]) return null;
		if (!otherRes[0].sess) return null;
		if (!otherRes[0].sess.passport) return null;

		const user = otherRes[0].sess.passport.user;
		const sessUser = userService.findUserWithBlocks(user.login);
		return sessUser;
	}
	
}

// export async function getUserFromSocket(socket: Socket, userService: UserService): Promise<UserDTO> {
// 	const cookie = socket.handshake.headers.cookie;
// 	if (!cookie) return null;
// 	const parsedCookie = parse(cookie);
// 	const cookieData = parsedCookie['connect.sid'];

// 	let sid = cookieData.substr(2, cookieData.indexOf(".") - 2);

// 	const postgresConnection = 
// 	{
// 		user: process.env.POSTGRES_USER,
// 		password: process.env.POSTGRES_PASSWORD,
// 		host: process.env.POSTGRES_HOST,
// 		port: process.env.POSTGRES_PORT,
// 		database: process.env.POSTGRES_DB
// 	};
			
// 	const knex = require('knex')({
// 		client: 'pg',
// 		connection: postgresConnection,
// 	});

// 	// const res = await knex.select("*").from("session");

// 	const otherRes = await knex("session").where("sid", sid);
// 	if (!otherRes) return null;
// 	if (!otherRes[0]) return null;
// 	if (!otherRes[0].sess) return null;
// 	if (!otherRes[0].sess.passport) return null;

// 	const user = otherRes[0].sess.passport.user;
// 	const sessUser = userService.findUserWithBlocks(user.login);
// 	return sessUser;
// }

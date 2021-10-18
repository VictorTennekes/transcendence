import { Socket } from "socket.io";
import { UserDTO } from "@user/dto/user.dto";
import { parse } from "cookie";
import { UserService } from "@user/user.service";
import { knex } from './../main'


export async function getUserFromSocket(socket: Socket, userService: UserService): Promise<UserDTO> {
	const cookie = socket.handshake.headers.cookie;
	if (!cookie) return null;
	const parsedCookie = parse(cookie);
	const cookieData = parsedCookie['connect.sid'];

	let sid = cookieData.substr(2, cookieData.indexOf(".") - 2);

	const otherRes = await knex("session").where("sid", sid);
	if (!otherRes) return null;
	if (!otherRes[0]) return null;
	if (!otherRes[0].sess) return null;
	if (!otherRes[0].sess.passport) return null;

	const user = otherRes[0].sess.passport.user;
	const sessUser = userService.findUserWithBlocks(user.login);
	return sessUser;
}

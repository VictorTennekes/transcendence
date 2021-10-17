import { Socket } from "socket.io";
import { UserDTO } from "@user/dto/user.dto";
import { parse } from "cookie";
import { UserService } from "@user/user.service";
import { AuthService } from "src/auth/auth.service";

// export async function getUserFromSocket(socket: Socket, userService: UserService, authService: AuthService): Promise<UserDTO> {
// 	const cookie = socket.handshake.headers.cookie;
// 	if (!cookie) return null;
// 	const parsedCookie = parse(cookie);
// 	const cookieData = parsedCookie['connect.sid'];

// 	let sid = cookieData.substr(2, cookieData.indexOf(".") - 2);

// 	const otherRes = await authService.getUser(sid);
// 	const parsedSession: any = otherRes.sess;
// 	const user = await userService.findOne(parsedSession.passport.user.login);
// 	return user;
// }

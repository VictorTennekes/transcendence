import { UserDTO } from "@user/dto/user.dto";
import { ChatDTO } from "./chat.dto";

export class MessageDTO {
	id: string;
	time: Date;
	owner: UserDTO;
	message: string;
	chat: ChatDTO;
}
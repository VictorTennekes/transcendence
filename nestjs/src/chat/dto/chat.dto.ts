import { UserDTO } from "@user/dto/user.dto";
import { MessageDTO } from "./message.dto";

export class ChatDTO {
	id: string;
	name: string;
	visibility: string;
	admins: UserDTO[];
	users: UserDTO[];
	messages: MessageDTO[];
}
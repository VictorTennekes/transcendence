import { UserDTO } from "@user/dto/user.dto";
import { MessageDTO } from "./message.dto";

export class ChatDTO {
	id: string;
	name: string;
	users: UserDTO[];
	messages: MessageDTO[];
}
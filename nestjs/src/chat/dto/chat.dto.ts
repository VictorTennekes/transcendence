import { UserDTO } from "@user/dto/user.dto";
import { MessageDTO } from "./message.dto";
import { ChatEntity } from "@chat/entity/chat.entity";

export class ChatDTO {
	id: string;
	name: string;
	visibility: string;
	owner: UserDTO;
	admins: UserDTO[];
	users: UserDTO[];
	messages: MessageDTO[];
}

export class ChatPassDTO {
	id: string;
	name: string;
	visibility: string;
	owner: UserDTO;
	admins: UserDTO[];
	users: UserDTO[];
	messages: MessageDTO[];
	password: string;
}
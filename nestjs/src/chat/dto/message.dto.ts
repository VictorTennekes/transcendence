import { ChatDTO } from "./chat.dto";

export class MessageDTO {
	id: string;
	time: Date;
	owner: string; // user_id?
	message: string;
	chat: ChatDTO;
}
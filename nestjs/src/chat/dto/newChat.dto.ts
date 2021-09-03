import { OmitType } from "@nestjs/mapped-types";
import { ChatDTO } from "@chat/dto/chat.dto";

export class NewChatDTO extends OmitType(ChatDTO, ['id', 'messages'] as const) {
	password: string;
}

export class ReceiveNewChatDTO {
	name: string;
	users: string[];
	admins: string[];
	visibility: string;
	password: string;
}
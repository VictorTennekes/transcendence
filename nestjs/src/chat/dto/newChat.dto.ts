import { OmitType } from "@nestjs/mapped-types";
import { ChatDTO } from "@chat/dto/chat.dto";

export class NewChatDTO extends OmitType(ChatDTO, ['id'] as const) {
}

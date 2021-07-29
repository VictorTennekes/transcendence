import { OmitType } from "@nestjs/mapped-types";
import { chatDTO } from "@chat/dto/chat.dto";

export class newChatDTO extends OmitType(chatDTO, ['id'] as const) {
}

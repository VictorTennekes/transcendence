import { OmitType } from "@nestjs/mapped-types";
import { MessageDTO } from "./message.dto";

export class newMessageDTO extends OmitType(MessageDTO, ['id', 'time'] as const) {
}
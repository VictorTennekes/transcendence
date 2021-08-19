import { UserDTO } from "@user/dto/user.dto";
import { chatDTO } from "./chat.dto";

export class MessageDTO {
    id: string;
    time: Date;
    // owner: string; // user_id?
    owner: UserDTO; // user_id?
    message: string;
    chat: chatDTO;
}
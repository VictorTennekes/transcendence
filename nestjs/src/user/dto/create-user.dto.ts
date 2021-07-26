import { OmitType } from "@nestjs/mapped-types"
import { UserDTO } from "./user.dto";

export class CreateUserDto extends OmitType(UserDTO, ['display_name'] as const) {
}

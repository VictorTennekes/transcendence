import { UserDTO } from "@user/dto/user.dto";
import { UserEntity } from "@user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Check } from "typeorm";
import { ChatEntity } from "./chat.entity";

@Entity('ban')
@Check(`"type" in ('mute', 'ban')`)
export class BanEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	type: string;

	@ManyToOne(() => ChatEntity)
	chat: ChatEntity;

	@ManyToOne(() => UserEntity)
	// @ManyToOne(() => UserEntity, user => user.bans)
	user: UserEntity;

	@Column()
	endTime: Date;
}
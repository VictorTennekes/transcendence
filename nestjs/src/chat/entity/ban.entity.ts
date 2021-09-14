import { UserDTO } from "@user/dto/user.dto";
import { UserEntity } from "@user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatEntity } from "./chat.entity";
@Entity('ban')
export class BanEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => ChatEntity)
	chat: ChatEntity;

	@ManyToOne(() => UserEntity)
	// @ManyToOne(() => UserEntity, user => user.bans)
	user: UserEntity;

	@Column()
	endTime: Date;
}
import { UserEntity } from "@user/entities/user.entity";
import { userInfo } from "os";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MessageEntity } from "./message.entity";

@Entity('chat')
export class ChatEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	name: string;

	// @ManyToMany(type => UserEntity, (user: UserEntity) => user.chats)
	// @JoinTable()
	// users: UserEntity[];

	@ManyToMany(type => UserEntity)
	@JoinTable()
	users: UserEntity[];


	@OneToMany(type => MessageEntity, message => message.chat)
	messages: MessageEntity[];

}

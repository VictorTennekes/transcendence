import { UserEntity } from "@user/entities/user.entity";
import { Check, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MessageEntity } from "./message.entity";

@Entity('chat')
@Check(`"visibility" in ('direct', 'public', 'private', 'protected')`)
export class ChatEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	name: string;

	@Column()
	visibility: string;

	@Column()
	password: string;

	@ManyToMany(type => UserEntity, UserEntity => UserEntity.chats, {cascade: true})
	@JoinTable()
	admins: UserEntity[]

	@ManyToMany(type => UserEntity, UserEntity => UserEntity.chats, {cascade: true})
	@JoinTable()
	users: UserEntity[];

	@OneToMany(type => MessageEntity, message => message.chat)
	messages: MessageEntity[];

}

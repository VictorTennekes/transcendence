import { UserEntity } from "@user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MessageEntity } from "./message.entity";

@Entity('chat')
export class ChatEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;
	
	@Column()
	name: string;
	
	@ManyToMany(type => UserEntity, user => user.chats)
	@JoinTable()
	users: UserEntity[];
	
	@OneToMany(type => MessageEntity, message => message.chat)
	messages: MessageEntity[];
	
}

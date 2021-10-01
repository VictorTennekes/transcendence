import { UserEntity } from "@user/entities/user.entity";
import { Check, Column, Entity, JoinTable, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BanEntity } from "./ban.entity";
import { MessageEntity } from "./message.entity";

@Entity('chat')
@Check(`"visibility" in ('direct', 'public', 'private', 'protected')`)
export class ChatEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({
		nullable: false
	})
	name: string;

	@Column()
	visibility: string;

	@Column()
	password: string;

	@OneToOne(() => UserEntity)
	@JoinColumn()
	owner: UserEntity;

	@ManyToMany(type => UserEntity, UserEntity => UserEntity.chats, {cascade: true})
	@JoinTable()
	admins: UserEntity[]

	@ManyToMany(type => UserEntity, UserEntity => UserEntity.chats, {cascade: true})
	@JoinTable()
	users: UserEntity[];

	@OneToMany(() => BanEntity, bans => bans.chat, {cascade: true})
	bans: BanEntity[];

	@OneToMany(type => MessageEntity, message => message.chat)
	messages: MessageEntity[];

}

import { UserEntity } from "@user/entities/user.entity";
import { Check, Column, Entity, JoinTable, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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

	@ManyToOne(() => UserEntity, {onDelete: "SET NULL"})
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
//TODO: also add an owner. Only owner can change privacy and add new admins. Admins can only mute and ban
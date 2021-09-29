import { ChatEntity } from "@chat/entity/chat.entity";
import { IsNotEmpty, MaxLength } from "class-validator";
import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn, Unique } from "typeorm";

//These class validator decorators are triggered by @UsePipes(new ValidationPipe()) on routes
@Entity()
export class UserEntity {
	@IsNotEmpty()
	@PrimaryColumn()
	intra_name: string;
	
	@MaxLength(50)
	@Column({
		type: "varchar",
		length: '50'
	})
	@IsNotEmpty()
	@Column({
		unique: true
	})
	display_name: string;

	@Column({
		nullable: true,
		type: "varchar",
	})
	avatar_url: string;

	@Column({
		type: 'boolean',
		default: false,
	})
	two_factor_enabled: boolean;

	@Column({
		type: 'varchar',
		nullable: true
	})
	two_factor_secret?: string;

	@ManyToMany((type) => ChatEntity, ChatEntity => ChatEntity.users)
	chats: ChatEntity[];

	@ManyToMany((type) => UserEntity, UserEntity => UserEntity.blockedByUsers)
	@JoinTable()
	blockedUsers: UserEntity[];

	@ManyToMany((type) => UserEntity, UserEntity => UserEntity.blockedUsers)
	blockedByUsers: UserEntity[];

}

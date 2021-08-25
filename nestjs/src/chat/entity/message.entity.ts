import { ConfigModule } from "@nestjs/config";
import { Column, CreateDateColumn, ManyToOne, Entity, PrimaryColumn, PrimaryGeneratedColumn, JoinColumn, OneToMany, OneToOne} from "typeorm";
import { ChatEntity } from "@chat/entity/chat.entity";
import { UserEntity } from "@user/entities/user.entity";
import { userInfo } from "os";

@Entity('message')
export class MessageEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@CreateDateColumn()
	time: Date;

	@ManyToOne(type => UserEntity, user => user.intra_name, {cascade: true})
	@JoinColumn()
	owner: UserEntity; //this used to be string

	// @Column()
	// owner: string;

	@Column()
	message: string;

	@ManyToOne(type => ChatEntity, chat => chat.messages)
	@JoinColumn()
	chat: ChatEntity;
}

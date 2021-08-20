import { ConfigModule } from "@nestjs/config";
import { Column, CreateDateColumn, ManyToOne, Entity, PrimaryColumn, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { ChatEntity } from "@chat/entity/chat.entity";

@Entity('message')
export class MessageEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;
	
	@CreateDateColumn()
	time: Date;
	
	@Column()
	owner: string; // TODO: UserEntity
	
	@Column()
	message: string;
	
	@ManyToOne(type => ChatEntity, (chat: ChatEntity) => chat.messages)
	@JoinColumn()
	chat: ChatEntity;
}

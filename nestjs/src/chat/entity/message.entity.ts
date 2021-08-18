import { ConfigModule } from "@nestjs/config";
import { Column, CreateDateColumn, ManyToOne, Entity, PrimaryColumn, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { chatEntity } from "@chat/entity/chat.entity";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @CreateDateColumn()
    time: Date;
    @Column()
    owner: string; // user_id?
    @Column()
    message: string;

    @ManyToOne(type => chatEntity, chat => chat.messages)
    @JoinColumn()
    chat: chatEntity;
}


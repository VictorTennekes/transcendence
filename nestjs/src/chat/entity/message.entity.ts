import { ConfigModule } from "@nestjs/config";
import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
//table should be called message history?
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
}


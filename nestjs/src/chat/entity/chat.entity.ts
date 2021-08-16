import { UserEntity } from "@user/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MessageEntity } from "./message.entity";

@Entity('chat')
export class chatEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column()
    name: string;

    // @ManyToMany(type => UserEntity) @JoinTable()
    // owners: UserEntity[];

    @OneToMany(type => MessageEntity, message => message.chat)
    messages: MessageEntity[];

}

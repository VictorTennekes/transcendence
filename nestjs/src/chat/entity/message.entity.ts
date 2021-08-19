import { ConfigModule } from "@nestjs/config";
import { Column, CreateDateColumn, ManyToOne, Entity, PrimaryColumn, PrimaryGeneratedColumn, JoinColumn, OneToMany, OneToOne} from "typeorm";
import { chatEntity } from "@chat/entity/chat.entity";
import { UserEntity } from "@user/entities/user.entity";
import { userInfo } from "os";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @CreateDateColumn()
    time: Date;

    // @Column()
    // owner: string; // TODO: userEntity
    // @Column()
    // owner: UserEntity;

    @OneToMany(type => UserEntity, user => user.intra_name, {cascade: true})
    @JoinColumn()
    owner: UserEntity;

    @Column()
    message: string;

    @ManyToOne(type => chatEntity, chat => chat.messages)
    @JoinColumn()
    chat: chatEntity;
}


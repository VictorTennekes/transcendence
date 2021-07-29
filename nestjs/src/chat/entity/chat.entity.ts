import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('chat')
export class chatEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column()
    name: string;
}

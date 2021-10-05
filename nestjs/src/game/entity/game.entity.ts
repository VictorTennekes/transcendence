import { UserEntity } from "@user/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GameEntity {
	@PrimaryColumn({type: 'varchar'})
	id: string;

	@Column({type: 'bigint'})
	duration: number;

	@Column({type: 'timestamp'})
	start: Date;

	@Column({type: 'timestamp'})
	end: Date;

	@ManyToMany((type) => UserEntity, (player) => player.games)
	@JoinTable({name: 'user_games'})
	players: UserEntity[];

	@Column({type: 'jsonb'})
	data: {
		scores: {[key: string] : number}
		winner: string;
	}
};

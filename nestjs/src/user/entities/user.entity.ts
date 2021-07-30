import { Type } from "class-transformer";
import { IsNotEmpty, MaxLength } from "class-validator";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class UserEntity {
	@IsNotEmpty()
	@PrimaryColumn()
	intra_name: string;

	@MaxLength(50)
	@Column( { length: '50'} )
	@IsNotEmpty()
	display_name: string;
}

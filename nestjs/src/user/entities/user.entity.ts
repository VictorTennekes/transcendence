import { Type } from "class-transformer";
import { IsNotEmpty, MaxLength } from "class-validator";
import { Column, Entity, PrimaryColumn } from "typeorm";

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
	display_name: string;

	@Column({
		nullable: true,
		type: "varchar",
	})
	avatar_url: string;
}

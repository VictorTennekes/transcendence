import {
	Entity,
	Column,
	PrimaryColumn,
} from 'typeorm';

@Entity('session')
export class SessionEntity {
	@PrimaryColumn({
		type: 'varchar',
		collation: 'default'
	})
	sid!: string;
	
	@Column('json')
	sess!: string;
	
	@Column('timestamp')
	expire!: number;
}

import {MigrationInterface, QueryRunner} from "typeorm";

export class removedPassword1627558527431 implements MigrationInterface {
    name = 'removedPassword1627558527431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_entity" DROP COLUMN "password"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_entity" ADD "password" character varying NOT NULL`);
    }

}

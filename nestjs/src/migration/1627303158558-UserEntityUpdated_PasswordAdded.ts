import {MigrationInterface, QueryRunner} from "typeorm";

export class UserEntityUpdatedPasswordAdded1627303158558 implements MigrationInterface {
    name = 'UserEntityUpdatedPasswordAdded1627303158558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_entity" ADD "password" character varying`);
        await queryRunner.query(`ALTER TABLE "user_entity" DROP COLUMN "display_name"`);
        await queryRunner.query(`ALTER TABLE "user_entity" ADD "display_name" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_entity" DROP COLUMN "display_name"`);
        await queryRunner.query(`ALTER TABLE "user_entity" ADD "display_name" character varying`);
        await queryRunner.query(`ALTER TABLE "user_entity" DROP COLUMN "password"`);
    }

}

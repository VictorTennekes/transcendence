import {MigrationInterface, QueryRunner} from "typeorm";

export class UserEntityCreated1627296054569 implements MigrationInterface {
    name = 'UserEntityCreated1627296054569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_entity" ("intra_name" character varying NOT NULL, "display_name" character varying, CONSTRAINT "PK_b68240ae678ae890652a9a25bf8" PRIMARY KEY ("intra_name"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_entity"`);
    }

}

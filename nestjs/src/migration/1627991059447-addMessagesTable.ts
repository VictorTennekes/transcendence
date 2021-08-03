import {MigrationInterface, QueryRunner} from "typeorm";

export class addMessagesTable1627991059447 implements MigrationInterface {
    name = 'addMessagesTable1627991059447'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "time" TIMESTAMP NOT NULL DEFAULT now(), "owner" character varying NOT NULL, "message" character varying NOT NULL, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "message"`);
    }

}

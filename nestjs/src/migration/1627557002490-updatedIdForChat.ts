import {MigrationInterface, QueryRunner} from "typeorm";

export class updatedIdForChat1627557002490 implements MigrationInterface {
    name = 'updatedIdForChat1627557002490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "PK_9d0b2ba74336710fd31154738a5"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "PK_9d0b2ba74336710fd31154738a5"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id")`);
    }

}

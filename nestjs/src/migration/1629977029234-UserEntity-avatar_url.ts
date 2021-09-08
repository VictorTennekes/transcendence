import {MigrationInterface, QueryRunner} from "typeorm";

export class UserEntityAvatarUrl1629977029234 implements MigrationInterface {
    name = 'UserEntityAvatarUrl1629977029234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "time" TIMESTAMP NOT NULL DEFAULT now(), "message" character varying NOT NULL, "ownerIntraName" character varying, "chatId" uuid, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_users_user_entity" ("chatId" uuid NOT NULL, "userEntityIntraName" character varying NOT NULL, CONSTRAINT "PK_58a35f476fc84ebe469e5224690" PRIMARY KEY ("chatId", "userEntityIntraName"))`);
        await queryRunner.query(`CREATE INDEX "IDX_14a3e231283d06484885baba56" ON "chat_users_user_entity" ("chatId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8730d7cf008e906b89623d6993" ON "chat_users_user_entity" ("userEntityIntraName") `);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_effd258461ee77746f2a0fd04b8" FOREIGN KEY ("ownerIntraName") REFERENCES "user_entity"("intra_name") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_619bc7b78eba833d2044153bacc" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_users_user_entity" ADD CONSTRAINT "FK_14a3e231283d06484885baba56d" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "chat_users_user_entity" ADD CONSTRAINT "FK_8730d7cf008e906b89623d69930" FOREIGN KEY ("userEntityIntraName") REFERENCES "user_entity"("intra_name") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_users_user_entity" DROP CONSTRAINT "FK_8730d7cf008e906b89623d69930"`);
        await queryRunner.query(`ALTER TABLE "chat_users_user_entity" DROP CONSTRAINT "FK_14a3e231283d06484885baba56d"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_619bc7b78eba833d2044153bacc"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_effd258461ee77746f2a0fd04b8"`);
        await queryRunner.query(`DROP INDEX "IDX_8730d7cf008e906b89623d6993"`);
        await queryRunner.query(`DROP INDEX "IDX_14a3e231283d06484885baba56"`);
        await queryRunner.query(`DROP TABLE "chat_users_user_entity"`);
        await queryRunner.query(`DROP TABLE "chat"`);
        await queryRunner.query(`DROP TABLE "message"`);
    }

}

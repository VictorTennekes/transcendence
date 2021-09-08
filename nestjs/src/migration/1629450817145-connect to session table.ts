import {MigrationInterface, QueryRunner} from "typeorm";

export class connectToSessionTable1629450817145 implements MigrationInterface {
    name = 'connectToSessionTable1629450817145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_session_expire"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_session_expire" ON "session" ("expire") `);
    }

}

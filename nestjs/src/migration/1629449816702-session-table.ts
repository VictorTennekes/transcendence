import {MigrationInterface, QueryRunner} from "typeorm";

export class sessionTable1629449816702 implements MigrationInterface {
    name = 'sessionTable1629449816702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "session" ("sid" character varying NOT NULL, "sess" json NOT NULL, "expire" TIMESTAMP NOT NULL, CONSTRAINT "PK_7575923e18b495ed2307ae629ae" PRIMARY KEY ("sid"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "session"`);
    }

}

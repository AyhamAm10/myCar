import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1748549686996 implements MigrationInterface {
    name = 'Test1748549686996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "otp" ("id" SERIAL NOT NULL, "phone" character varying(15) NOT NULL, "otp" character varying(6) NOT NULL, "expiry" TIMESTAMP NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "otp"`);
    }

}

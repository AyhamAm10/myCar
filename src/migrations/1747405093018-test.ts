import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1747405093018 implements MigrationInterface {
    name = 'Test1747405093018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_e2c56ee6f05695da6b1abcb01c1"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "model_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" ADD "model_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_e2c56ee6f05695da6b1abcb01c1" FOREIGN KEY ("model_id") REFERENCES "car_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

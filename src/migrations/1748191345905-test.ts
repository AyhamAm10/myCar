import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1748191345905 implements MigrationInterface {
    name = 'Test1748191345905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_4f38057c8b26aaade245138ffa5"`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_4f38057c8b26aaade245138ffa5" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_4f38057c8b26aaade245138ffa5"`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_4f38057c8b26aaade245138ffa5" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

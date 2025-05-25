import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1748191558181 implements MigrationInterface {
    name = 'Test1748191558181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "promotion_requests" DROP CONSTRAINT "FK_119be25c2d338db00d27ac5e6d0"`);
        await queryRunner.query(`ALTER TABLE "promotion_requests" DROP CONSTRAINT "FK_faa9fb3f3fe4ef76578164a0fdd"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" DROP CONSTRAINT "FK_29559dc67a00578bfa373542d66"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" DROP CONSTRAINT "FK_8c5e46d66a1847c31384c678350"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_673bd295e52580c0fb09d0fbbb8"`);
        await queryRunner.query(`ALTER TABLE "promotion_requests" ADD CONSTRAINT "FK_119be25c2d338db00d27ac5e6d0" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promotion_requests" ADD CONSTRAINT "FK_faa9fb3f3fe4ef76578164a0fdd" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ADD CONSTRAINT "FK_29559dc67a00578bfa373542d66" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ADD CONSTRAINT "FK_8c5e46d66a1847c31384c678350" FOREIGN KEY ("attribute_id") REFERENCES "attribute"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_673bd295e52580c0fb09d0fbbb8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_673bd295e52580c0fb09d0fbbb8"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" DROP CONSTRAINT "FK_8c5e46d66a1847c31384c678350"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" DROP CONSTRAINT "FK_29559dc67a00578bfa373542d66"`);
        await queryRunner.query(`ALTER TABLE "promotion_requests" DROP CONSTRAINT "FK_faa9fb3f3fe4ef76578164a0fdd"`);
        await queryRunner.query(`ALTER TABLE "promotion_requests" DROP CONSTRAINT "FK_119be25c2d338db00d27ac5e6d0"`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_673bd295e52580c0fb09d0fbbb8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ADD CONSTRAINT "FK_8c5e46d66a1847c31384c678350" FOREIGN KEY ("attribute_id") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ADD CONSTRAINT "FK_29559dc67a00578bfa373542d66" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promotion_requests" ADD CONSTRAINT "FK_faa9fb3f3fe4ef76578164a0fdd" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promotion_requests" ADD CONSTRAINT "FK_119be25c2d338db00d27ac5e6d0" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

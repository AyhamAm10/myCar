import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1746794801649 implements MigrationInterface {
    name = 'Test1746794801649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attribute_options" DROP CONSTRAINT "FK_d2a2b557f6fb988abcde7921582"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" DROP CONSTRAINT "FK_8c5e46d66a1847c31384c678350"`);
        await queryRunner.query(`CREATE TYPE "public"."attribute_input_type_enum" AS ENUM('text', 'dropdown', 'nested_dropdown')`);
        await queryRunner.query(`CREATE TYPE "public"."attribute_purpose_enum" AS ENUM('sale', 'rent', 'both')`);
        await queryRunner.query(`CREATE TABLE "attribute" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "icon" character varying, "input_type" "public"."attribute_input_type_enum" NOT NULL DEFAULT 'text', "show_in_search" boolean NOT NULL DEFAULT false, "purpose" "public"."attribute_purpose_enum" NOT NULL DEFAULT 'sale', "has_child" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "parent_id" integer, "parent_option_id" integer, "car_type_id" integer, CONSTRAINT "PK_b13fb7c5c9e9dff62b60e0de729" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "attribute_options" ALTER COLUMN "attribute_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "car_attributes" DROP CONSTRAINT "FK_29559dc67a00578bfa373542d66"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ALTER COLUMN "car_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ALTER COLUMN "attribute_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attribute_options" ADD CONSTRAINT "FK_d2a2b557f6fb988abcde7921582" FOREIGN KEY ("attribute_id") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ADD CONSTRAINT "FK_29559dc67a00578bfa373542d66" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ADD CONSTRAINT "FK_8c5e46d66a1847c31384c678350" FOREIGN KEY ("attribute_id") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD CONSTRAINT "FK_2f225ab5b29d3438fb03c3d2e8b" FOREIGN KEY ("parent_id") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD CONSTRAINT "FK_3ecd0212f54883ae3199493f5fb" FOREIGN KEY ("parent_option_id") REFERENCES "attribute_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD CONSTRAINT "FK_d253959caead4107e03f6dcba20" FOREIGN KEY ("car_type_id") REFERENCES "car_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attribute" DROP CONSTRAINT "FK_d253959caead4107e03f6dcba20"`);
        await queryRunner.query(`ALTER TABLE "attribute" DROP CONSTRAINT "FK_3ecd0212f54883ae3199493f5fb"`);
        await queryRunner.query(`ALTER TABLE "attribute" DROP CONSTRAINT "FK_2f225ab5b29d3438fb03c3d2e8b"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" DROP CONSTRAINT "FK_8c5e46d66a1847c31384c678350"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" DROP CONSTRAINT "FK_29559dc67a00578bfa373542d66"`);
        await queryRunner.query(`ALTER TABLE "attribute_options" DROP CONSTRAINT "FK_d2a2b557f6fb988abcde7921582"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ALTER COLUMN "attribute_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ALTER COLUMN "car_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ADD CONSTRAINT "FK_29559dc67a00578bfa373542d66" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute_options" ALTER COLUMN "attribute_id" SET NOT NULL`);
        await queryRunner.query(`DROP TABLE "attribute"`);
        await queryRunner.query(`DROP TYPE "public"."attribute_purpose_enum"`);
        await queryRunner.query(`DROP TYPE "public"."attribute_input_type_enum"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ADD CONSTRAINT "FK_8c5e46d66a1847c31384c678350" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute_options" ADD CONSTRAINT "FK_d2a2b557f6fb988abcde7921582" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

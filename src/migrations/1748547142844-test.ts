import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1748547142844 implements MigrationInterface {
    name = 'Test1748547142844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "favorites" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "car_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_88a361e3da2a9f0327222056a8c" UNIQUE ("user_id", "car_id"), CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."promotion_requests_request_type_enum" AS ENUM('account_verification', 'listing_promotion')`);
        await queryRunner.query(`CREATE TYPE "public"."promotion_requests_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "promotion_requests" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "car_id" integer, "request_type" "public"."promotion_requests_request_type_enum" NOT NULL, "status" "public"."promotion_requests_status_enum" NOT NULL DEFAULT 'pending', "admin_notes" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_785c7e2cf9ed0c66724ef20d0e6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "title" character varying NOT NULL, "message" character varying NOT NULL, "notification_type" character varying NOT NULL, "related_id" integer NOT NULL, "related_type" character varying NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('super_admin', 'admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "phone" character varying NOT NULL, "password_hash" character varying NOT NULL, "image" character varying, "verified" boolean NOT NULL DEFAULT false, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "device_token" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "governorates" ("id" SERIAL NOT NULL, "name_ar" character varying NOT NULL, "name_en" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_60144e6cbcf9fc378d0dabcb7d1" UNIQUE ("name_ar"), CONSTRAINT "UQ_9de35e45e66703fbbcb6c408d16" UNIQUE ("name_en"), CONSTRAINT "PK_3b62bb4e44b53e3119d0a8648fa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attribute_options" ("id" SERIAL NOT NULL, "value_ar" character varying NOT NULL, "value_en" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "attribute_id" integer, CONSTRAINT "PK_696cd598705915238f202da10a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "car_attributes" ("id" SERIAL NOT NULL, "custom_value" character varying, "car_id" integer, "attribute_id" integer, "attribute_option_id" integer, CONSTRAINT "PK_664d34d370a8c123e498edb704d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."cars_status_enum" AS ENUM('active', 'sold', 'hidden')`);
        await queryRunner.query(`CREATE TABLE "cars" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "images" text array NOT NULL, "USD_price" numeric NOT NULL, "SYP_price" numeric NOT NULL, "car_type_id" integer NOT NULL, "governorate_id" integer NOT NULL, "address" character varying NOT NULL, "lat" double precision NOT NULL, "long" double precision NOT NULL, "is_featured" boolean NOT NULL DEFAULT false, "is_verified" boolean NOT NULL DEFAULT false, "status" "public"."cars_status_enum" NOT NULL DEFAULT 'active', "views_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fc218aa84e79b477d55322271b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "car_types" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_921d6253a98ecfc574485ecb3db" UNIQUE ("name"), CONSTRAINT "PK_4cf27897f7f3a780e07b83e2706" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."attribute_input_type_enum" AS ENUM('text', 'dropdown', 'nested_dropdown')`);
        await queryRunner.query(`CREATE TYPE "public"."attribute_purpose_enum" AS ENUM('sale', 'rent', 'both')`);
        await queryRunner.query(`CREATE TABLE "attribute" ("id" SERIAL NOT NULL, "title_ar" character varying NOT NULL, "title_en" character varying NOT NULL, "icon" character varying, "input_type" "public"."attribute_input_type_enum" NOT NULL DEFAULT 'text', "show_in_search" boolean NOT NULL DEFAULT false, "purpose" "public"."attribute_purpose_enum" NOT NULL DEFAULT 'sale', "has_child" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "parent_id" integer, "parent_option_id" integer, "car_type_id" integer, CONSTRAINT "PK_b13fb7c5c9e9dff62b60e0de729" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "guest_sessions" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "device_id" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3a3f64c32b00615aeb8ec3779de" UNIQUE ("token"), CONSTRAINT "PK_7c077389b040139ae9487c1b03e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_4f38057c8b26aaade245138ffa5" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promotion_requests" ADD CONSTRAINT "FK_119be25c2d338db00d27ac5e6d0" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promotion_requests" ADD CONSTRAINT "FK_faa9fb3f3fe4ef76578164a0fdd" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute_options" ADD CONSTRAINT "FK_d2a2b557f6fb988abcde7921582" FOREIGN KEY ("attribute_id") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ADD CONSTRAINT "FK_29559dc67a00578bfa373542d66" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ADD CONSTRAINT "FK_8c5e46d66a1847c31384c678350" FOREIGN KEY ("attribute_id") REFERENCES "attribute"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_attributes" ADD CONSTRAINT "FK_e4e440c690c5f311ddba226f9e0" FOREIGN KEY ("attribute_option_id") REFERENCES "attribute_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_673bd295e52580c0fb09d0fbbb8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_25871c8cfb085be6da95b29b528" FOREIGN KEY ("car_type_id") REFERENCES "car_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_9a478185ab5ccb99ed40ca55f43" FOREIGN KEY ("governorate_id") REFERENCES "governorates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD CONSTRAINT "FK_2f225ab5b29d3438fb03c3d2e8b" FOREIGN KEY ("parent_id") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD CONSTRAINT "FK_3ecd0212f54883ae3199493f5fb" FOREIGN KEY ("parent_option_id") REFERENCES "attribute_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute" ADD CONSTRAINT "FK_d253959caead4107e03f6dcba20" FOREIGN KEY ("car_type_id") REFERENCES "car_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attribute" DROP CONSTRAINT "FK_d253959caead4107e03f6dcba20"`);
        await queryRunner.query(`ALTER TABLE "attribute" DROP CONSTRAINT "FK_3ecd0212f54883ae3199493f5fb"`);
        await queryRunner.query(`ALTER TABLE "attribute" DROP CONSTRAINT "FK_2f225ab5b29d3438fb03c3d2e8b"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_9a478185ab5ccb99ed40ca55f43"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_25871c8cfb085be6da95b29b528"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_673bd295e52580c0fb09d0fbbb8"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" DROP CONSTRAINT "FK_e4e440c690c5f311ddba226f9e0"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" DROP CONSTRAINT "FK_8c5e46d66a1847c31384c678350"`);
        await queryRunner.query(`ALTER TABLE "car_attributes" DROP CONSTRAINT "FK_29559dc67a00578bfa373542d66"`);
        await queryRunner.query(`ALTER TABLE "attribute_options" DROP CONSTRAINT "FK_d2a2b557f6fb988abcde7921582"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "promotion_requests" DROP CONSTRAINT "FK_faa9fb3f3fe4ef76578164a0fdd"`);
        await queryRunner.query(`ALTER TABLE "promotion_requests" DROP CONSTRAINT "FK_119be25c2d338db00d27ac5e6d0"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_4f38057c8b26aaade245138ffa5"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593"`);
        await queryRunner.query(`DROP TABLE "guest_sessions"`);
        await queryRunner.query(`DROP TABLE "attribute"`);
        await queryRunner.query(`DROP TYPE "public"."attribute_purpose_enum"`);
        await queryRunner.query(`DROP TYPE "public"."attribute_input_type_enum"`);
        await queryRunner.query(`DROP TABLE "car_types"`);
        await queryRunner.query(`DROP TABLE "cars"`);
        await queryRunner.query(`DROP TYPE "public"."cars_status_enum"`);
        await queryRunner.query(`DROP TABLE "car_attributes"`);
        await queryRunner.query(`DROP TABLE "attribute_options"`);
        await queryRunner.query(`DROP TABLE "governorates"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "promotion_requests"`);
        await queryRunner.query(`DROP TYPE "public"."promotion_requests_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."promotion_requests_request_type_enum"`);
        await queryRunner.query(`DROP TABLE "favorites"`);
    }

}

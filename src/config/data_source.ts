import * as dotenv from "dotenv";
import * as fs from "fs";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Attribute } from "../entities/attribute";
import { AttributeOption } from "../entities/attribute-option";
import { Car } from "../entities/car";
import { CarAttribute } from "../entities/car-attribute";
import { CarModel } from "../entities/car-modal";
import { CarType } from "../entities/car-type";
import { Favorite } from "../entities/favorite";
import { Governorate } from "../entities/governorate";
import { GuestSession } from "../entities/guest-session";
import { Notification } from "../entities/notification";
import { PromotionRequest } from "../entities/promotion-request";
import { User } from "../entities/user";

dotenv.config();
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, NODE_ENV } =
  process.env;


export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT || "5432"),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: false,
  logging: false,
  schema: "public",
  ssl: false,
  entities: [
    Attribute,
    AttributeOption,
    Car,
    CarAttribute,
    CarModel,
    CarType,
    Favorite,
    Governorate,
    GuestSession,
    Notification,
    PromotionRequest,
    User
  ],

  migrations: [__dirname + "/../migrations/*.ts"],
  subscribers: [],
});

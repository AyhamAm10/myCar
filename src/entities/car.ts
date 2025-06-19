import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./user";
import { CarType } from "./car-type";
import { Governorate } from "./governorate";
import { Favorite } from "./favorite";
import { PromotionRequest } from "./promotion-request";
import { CarAttribute } from "./car-attribute";

@Entity("cars")
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id" })
  userId: number;

  @Column()
  title_ar: string;

  @Column()
  title_en: string;

  @Column()
  description: string;

  @Column("text", { array: true })
  images: string[];

  @Column({ name: "USD_price", type: "decimal" })
  usdPrice: number;

  @Column({ name: "SYP_price", type: "decimal" })
  sypPrice: number;

  @Column({ name: "car_type_id" })
  carTypeId: number;

  @Column({ name: "governorate_id" })
  governorateId: number;

  @Column()
  address: string;

  @Column("double precision")
  lat: number;

  @Column("double precision")
  long: number;

  @Column({ name: "is_featured", default: false })
  isFeatured: boolean;

  @Column({ name: "is_verified", default: false })
  isVerified: boolean;

  @Column({
    type: "enum",
    enum: ["active", "sold", "hidden"],
    default: "active",
  })
  status: "active" | "sold" | "hidden";

  @Column({ name: "views_count", default: 0 })
  viewsCount: number;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.cars, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => CarType, (carType) => carType.cars)
  @JoinColumn({ name: "car_type_id" })
  carType: CarType;

  @ManyToOne(() => Governorate)
  @JoinColumn({ name: "governorate_id" })
  governorateInfo: Governorate;

  @OneToMany(() => Favorite, (favorite) => favorite.car)
  favorites: Favorite[];

  @OneToMany(() => PromotionRequest, (request) => request.car)
  promotionRequests: PromotionRequest[];

  @OneToMany(() => CarAttribute, (attribute) => attribute.car)
  attributes: CarAttribute[];
}

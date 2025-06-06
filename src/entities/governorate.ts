import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Car } from "./car";

@Entity("governorates")
export class Governorate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "name_ar", unique: true })
  nameAr: string;

  @Column({ name: "name_en", unique: true })
  nameEn: string;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  // Relations
  @OneToMany(() => Car, (car) => car.governorateInfo)
  cars: Car[];
}

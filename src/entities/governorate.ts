import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Car } from "./car";

@Entity("governorates")
export class Governorate {
  @PrimaryColumn({ unique: true })
  name: string;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  // Relations
  @OneToMany(() => Car, (car) => car.governorate)
  cars: Car[];
}

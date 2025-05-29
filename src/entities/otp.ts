import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 15 })
  phone: string;

  @Column({ type: "varchar", length: 6 })
  otp: string;

  @Column({ type: "timestamp" })
  expiry: Date;

  @Column({ type: "int", default: 0 })
  attempts: number;

  @CreateDateColumn()
  createdAt: Date;
}

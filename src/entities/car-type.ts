import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Car } from './car';

@Entity('car_types')
export class CarType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Car, car => car.carType)
  cars: Car[];
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { CarType } from './car-type';
import { Car } from './car';

@Entity('car_models')
export class CarModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'car_type_id' })
  carTypeId: number;

  @Column()
  name: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => CarType, carType => carType.models)
  carType: CarType;

  @OneToMany(() => Car, car => car.model)
  cars: Car[];
}
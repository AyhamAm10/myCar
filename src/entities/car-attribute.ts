import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Car } from './car';
import { Attribute } from './attribute';
import { AttributeOption } from './attribute-option';

@Entity('car_attributes')
export class CarAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'car_id' })
  carId: number;

  @Column({ name: 'attribute_id' })
  attributeId: number;

  @Column({ name: 'attribute_option_id', nullable: true })
  attributeOptionId: number;

  @Column({ name: 'custom_value', nullable: true })
  customValue: string;

  // Relations
  @ManyToOne(() => Car, car => car.attributes)
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @ManyToOne(() => Attribute)
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @ManyToOne(() => AttributeOption, { nullable: true })
  @JoinColumn({ name: 'attribute_option_id' })
  attributeOption: AttributeOption;
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Car } from './car';
import { Attribute } from './Attributes';
import { AttributeOption } from './attribute-option';

@Entity('car_attributes')
export class CarAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'custom_value', nullable: true })
  customValue: string;
  
  @ManyToOne(() => Car, car => car.attributes , { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @ManyToOne(() => Attribute , { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @ManyToOne(() => AttributeOption, { nullable: true })
  @JoinColumn({ name: 'attribute_option_id' })
  attributeOption: AttributeOption;
}
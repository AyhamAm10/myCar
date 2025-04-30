import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Attribute } from './attribute';
import { CarAttribute } from './car-attribute';
@Entity('attribute_options')
export class AttributeOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'attribute_id' })
  attributeId: number;

  @Column()
  value: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Attribute, attribute => attribute.options)
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @OneToMany(() => CarAttribute, carAttribute => carAttribute.attributeOption)
  carAttributes: CarAttribute[];
}
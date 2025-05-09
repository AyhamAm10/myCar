import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Attribute } from './Attributes';
import { CarAttribute } from './car-attribute';

@Entity('attribute_options')
export class AttributeOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Attribute, attribute => attribute.options)
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @OneToMany(() => CarAttribute, carAttribute => carAttribute.attributeOption)
  carAttributes: CarAttribute[];

  @OneToMany(() => Attribute, attribute => attribute.parentOption)
  childAttributes: Attribute[];

  // @ManyToMany(() => Attribute)
  // @JoinTable({
  //   name: 'option_related_attributes',
  //   joinColumn: { name: 'option_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'attribute_id', referencedColumnName: 'id' }
  // })
  // relatedAttributes: Attribute[];

  // @ManyToMany(() => AttributeOption)
  // @JoinTable({
  //   name: 'option_related_options',
  //   joinColumn: { name: 'option_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'related_option_id', referencedColumnName: 'id' }
  // })
  // relatedOptions: AttributeOption[];

}
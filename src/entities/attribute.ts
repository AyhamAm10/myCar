import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AttributeOption } from './attribute-option';
import { CarAttribute } from './car-attribute';

@Entity('attributes')
export class Attribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    name: 'input_type',
    type: 'enum',
    enum: ['dropdown', 'text', 'number', 'checkbox'],
    default: 'dropdown'
  })
  inputType: 'dropdown' | 'text' | 'number' | 'checkbox';

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Relations
  @OneToMany(() => AttributeOption, option => option.attribute)
  options: AttributeOption[];

  @OneToMany(() => CarAttribute, carAttribute => carAttribute.attribute)
  carAttributes: CarAttribute[];
}
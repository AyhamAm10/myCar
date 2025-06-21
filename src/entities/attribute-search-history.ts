import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Attribute } from "./Attributes";
import { AttributeOption } from "./attribute-option";
import { User } from "./user";

@Entity('attribute_search_history')
export class AttributeSearchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Attribute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @ManyToOne(() => AttributeOption, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_option_id' })
  attributeOption: AttributeOption;

  @Column({ default: 1 })
  count: number;

  @Column({ name: 'last_searched_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastSearchedAt: Date;


  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'user_id' })
  user: User;
}

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn
} from "typeorm";
import { CarAttribute } from "./car-attribute";
import { CarType } from "./car-type";
import { AttributeOption } from "./attribute-option";

export enum AttributeFor {
    sale = "sale",       
    rent = "rent",       
    both = "both",     
}

export enum InputType {
    TEXT = "text",
    DROPDOWN = "dropdown",
    NESTED_DROPDOWN = "nested_dropdown"
}

@Entity("attribute")
export class Attribute {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    title_ar: string;

    @Column()
    title_en: string;
  
    @Column({ nullable: true })
    icon: string;
  
    @Column({
        type: "enum",
        enum: InputType,
        default: InputType.TEXT,
    })
    input_type: InputType;
  
    @OneToMany(() => AttributeOption, option => option.attribute)
    options: AttributeOption[];
  
    @Column({ default: false, name: 'show_in_search' }) 
    showInSearch: boolean; 
  
    @Column({
        type: "enum",
        enum: AttributeFor,
        default: AttributeFor.sale, 
    })
    purpose: AttributeFor; 
  
    @ManyToOne(() => Attribute, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent: Attribute;
  
    @OneToMany(() => Attribute, attribute => attribute.parent)
    children: Attribute[];
  

    @ManyToOne(() => AttributeOption, option => option.childAttributes)
    @JoinColumn({ name: 'parent_option_id' }) 
    parentOption: AttributeOption;
  
    @Column({ default: false, name: 'has_child' })
    hasChild: boolean;
  
    @ManyToOne(() => CarType, { nullable: true })
    @JoinColumn({ name: 'car_type_id' })
    carType: CarType;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
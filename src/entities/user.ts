import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Car } from './car';
import { Favorite } from './favorite';
import { PromotionRequest } from './promotion-request';
import { Notification } from './notification';

export enum UserRole {
  superAdmin = "super_admin",
  admin = "admin",
  user = "user"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ nullable: true })
  image: string;


  @Column({ default: false })
  verified: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.user
  })
  role: UserRole

  @Column({ name: 'device_token', nullable: true })
  deviceToken: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Car, car => car.user)
  cars: Car[];

  @OneToMany(() => Favorite, favorite => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => PromotionRequest, request => request.user)
  promotionRequests: PromotionRequest[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];
}
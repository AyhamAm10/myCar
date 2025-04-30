import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user';
import { Car } from './car';

@Entity('promotion_requests')
export class PromotionRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'car_id', nullable: true })
  carId: number;

  @Column({
    name: 'request_type',
    type: 'enum',
    enum: ['account_verification', 'listing_promotion']
  })
  requestType: 'account_verification' | 'listing_promotion';

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ name: 'admin_notes', nullable: true })
  adminNotes: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.promotionRequests)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Car, { nullable: true })
  @JoinColumn({ name: 'car_id' })
  car: Car;
}
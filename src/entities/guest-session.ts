import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('guest_sessions')
export class GuestSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  token: string;

  @Column({ name: 'device_id' })
  deviceId: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
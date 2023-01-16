/* eslint-disable prettier/prettier */
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_token')
export class UserToken {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'user_token_id' })
  userTokenId: number;

  @Column({ type: 'integer', name: 'user_id', unsigned: true })
  userId: number;

  @Column({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
  })
  expiresAt: Date;

  @Column({ name: 'is_valid', type: 'smallint', default: () => '1' })
  @IsNotEmpty()
  @IsIn([0, 1])
  isValid: number;
}

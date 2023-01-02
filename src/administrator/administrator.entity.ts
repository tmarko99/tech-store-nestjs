/* eslint-disable prettier/prettier */
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index("administrator_pkey", ["administratorId"], { unique: true })
@Index("uq_administrator_username", ["username"], { unique: true })
@Entity()
export class Administrator {
  @PrimaryGeneratedColumn({ name: 'administrator_id', type: 'integer'})
  administratorId: number;

  @Column({ type: 'character varying', length: '32', unique: true })
  username: string;

  @Column({ name: 'password_hash', type: 'character varying', length: '128' })
  passwordHash: string;
}

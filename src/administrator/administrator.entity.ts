/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, Matches, IsHash } from 'class-validator';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index("administrator_pkey", ["administratorId"], { unique: true })
@Index("uq_administrator_username", ["username"], { unique: true })
@Entity()
export class Administrator {
  @PrimaryGeneratedColumn({ name: 'administrator_id', type: 'integer'})
  administratorId: number;

  @Column({ type: 'character varying', length: '32', unique: true })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z][a-z0-9\.]{3, 30}[a-z0-9]$/)
  username: string;

  @Column({ name: 'password_hash', type: 'character varying', length: '128' })
  @IsNotEmpty()
  @IsHash('sh256')
  passwordHash: string;
}

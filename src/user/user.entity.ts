import {
  IsEmail,
  IsHash,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from '../cart/cart.entity';

@Index('uq_user_email', ['email'], { unique: true })
@Index('uq_user_phone_number', ['phoneNumber'], { unique: true })
@Index('user_pkey', ['userId'], { unique: true })
@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'user_id' })
  userId: number;

  @Column({
    type: 'character varying',
    unique: true,
    length: 255,
  })
  @IsNotEmpty()
  @IsEmail({
    allow_ip_domain: false,
    allow_utf8_local_part: true,
    require_tld: true,
  })
  email: string;

  @Column({ name: 'password_hash', type: 'character varying', length: 128 })
  @IsNotEmpty()
  @IsString()
  @IsHash('sha256')
  passwordHash: string;

  @Column({ type: 'character varying', length: 64 })
  @IsNotEmpty()
  @IsString()
  @Length(2, 64)
  forename: string;

  @Column({ type: 'character varying', length: 64 })
  @IsNotEmpty()
  @IsString()
  @Length(2, 64)
  surname: string;

  @Column({
    name: 'phone_number',
    type: 'character varying',
    unique: true,
    length: 24,
  })
  @IsNotEmpty()
  @IsPhoneNumber(null)
  @Length(2, 64)
  phoneNumber: string;

  @Column({ name: 'postal_address', type: 'text' })
  @IsNotEmpty()
  @IsString()
  @Length(10, 512)
  postalAddress: string;

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];
}

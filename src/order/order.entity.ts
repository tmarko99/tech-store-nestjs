import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from '../cart/cart.entity';

@Index('uq_order_cart_id', ['cartId'], { unique: true })
@Index('order_pkey', ['orderId'], { unique: true })
@Entity('order')
export class Order {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'order_id' })
  orderId: number;

  @Column({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'cart_id', type: 'integer', unique: true })
  cartId: number;

  @Column({
    type: 'enum',
    enum: ['rejected', 'accepted', 'shipped', 'pending'],
    default: () => "'pending'",
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['rejected', 'accepted', 'shipped', 'pending'])
  status: 'rejected' | 'accepted' | 'shipped' | 'pending';

  @OneToOne(() => Cart, (cart) => cart.order, {
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'cart_id', referencedColumnName: 'cartId' }])
  cart: Cart;
}

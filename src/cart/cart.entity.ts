import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartArticle } from './cart-article.entity';
import { Order } from '../order/order.entity';
import { User } from '../user/user.entity';

@Index('cart_pkey', ['cartId'], { unique: true })
@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'cart_id' })
  cartId: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ type: 'integer', name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.carts, {
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: User;

  @OneToMany(() => CartArticle, (cartArticle) => cartArticle.cart)
  cartArticles: CartArticle[];

  @OneToOne(() => Order, (order) => order.cart)
  order: Order;
}

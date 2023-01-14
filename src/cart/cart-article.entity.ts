import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Article } from '../article/article.entity';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

@Index('uq_cart_article_cart_id_article_id', ['articleId', 'cartId'], {
  unique: true,
})
@Index('cart_article_pkey', ['cartArticleId'], { unique: true })
@Entity('cart_article')
export class CartArticle {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'cart_article_id' })
  cartArticleId: number;

  @Column({ name: 'cart_id', type: 'integer', unique: true })
  cartId: number;

  @Column({ name: 'article_id', type: 'integer', unique: true })
  articleId: number;

  @Column({ type: 'integer' })
  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @IsPositive()
  quantity: number;

  @ManyToOne(() => Article, (article) => article.cartArticles, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'article_id', referencedColumnName: 'articleId' }])
  article: Article;

  @ManyToOne(() => Cart, (cart) => cart.cartArticles, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'cart_id', referencedColumnName: 'cartId' }])
  cart: Cart;
}

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArticleFeature } from './article-feature.entity';
import { ArticlePrice } from './article-price.entity';
import { CartArticle } from '../cart/cart-article.entity';
import { Category } from '../category/category.entity';
import { Photo } from '../photo/photo.entity';

@Index('article_pkey', ['articleId'], { unique: true })
@Entity()
export class Article {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'article_id' })
  articleId: number;

  @Column({ type: 'character varying', length: 128 })
  name: string;

  @Column({ type: 'character varying', length: 255 })
  excerpt: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'is_promoted', type: 'smallint', default: () => '0' })
  isPromoted: number;

  @Column({
    type: 'enum',
    enum: ['available', 'visible', 'hidden'],
    default: () => "'available'",
  })
  status: 'available' | 'visible' | 'hidden';

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Category, (category) => category.articles, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'category_id', referencedColumnName: 'categoryId' }])
  category: Category;

  @OneToMany(() => ArticleFeature, (articleFeature) => articleFeature.article)
  articleFeatures: ArticleFeature[];

  @OneToMany(() => ArticlePrice, (articlePrice) => articlePrice.article)
  articlePrices: ArticlePrice[];

  @OneToMany(() => CartArticle, (cartArticle) => cartArticle.article)
  cartArticles: CartArticle[];

  @OneToMany(() => Photo, (photo) => photo.article)
  photos: Photo[];
}

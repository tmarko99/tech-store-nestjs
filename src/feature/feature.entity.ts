import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArticleFeature } from '../article/article-feature.entity';
import { Category } from '../category/category.entity';
import { Article } from '../article/article.entity';

@Index('uq_feature_name_category_id', ['categoryId', 'name'], { unique: true })
@Index('feature_pkey', ['featureId'], { unique: true })
@Entity('feature')
export class Feature {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'feature_id' })
  featureId: number;

  @Column({ name: 'name', type: 'character varying', unique: true, length: 32 })
  name: string;

  @Column({ name: 'category_id', type: 'integer', unique: true })
  categoryId: number;

  @OneToMany(() => ArticleFeature, (articleFeature) => articleFeature.feature)
  articleFeatures: ArticleFeature[];

  @ManyToMany(() => Article, (article) => article.features)
  @JoinTable({
    name: 'article_feature',
    joinColumn: { name: 'feature_id', referencedColumnName: 'featureId' },
    inverseJoinColumn: {
      name: 'article_id',
      referencedColumnName: 'articleId',
    },
  })
  articles: Article[];

  @ManyToOne(() => Category, (category) => category.features, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'category_id', referencedColumnName: 'categoryId' }])
  category: Category;
}

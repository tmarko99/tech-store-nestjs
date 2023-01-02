import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { Feature } from '../feature/feature.entity';

@Index('article_feature_pkey', ['articleFeatureId'], { unique: true })
@Index('uq_article_feature_article_id_feature_id', ['articleId', 'featureId'], {
  unique: true,
})
@Entity('article_feature')
export class ArticleFeature {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'article_feature_id' })
  articleFeatureId: number;

  @Column({ name: 'article_id', type: 'integer', unique: true })
  articleId: number;

  @Column({ name: 'feature_id', type: 'integer', unique: true })
  featureId: number;

  @Column({ type: 'character varying', length: 255 })
  value: string;

  @ManyToOne(() => Article, (article) => article.articleFeatures, {
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'article_id', referencedColumnName: 'articleId' }])
  article: Article;

  @ManyToOne(() => Feature, (feature) => feature.articleFeatures, {
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'feature_id', referencedColumnName: 'featureId' }])
  feature: Feature;
}

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Article } from '../article/article.entity';

@Index('uq_photo_image_path', ['imagePath'], { unique: true })
@Index('photo_pkey', ['photoId'], { unique: true })
@Entity('photo')
export class Photo {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'photo_id' })
  photoId: number;

  @Column({
    name: 'image_path',
    type: 'character varying',
    unique: true,
    length: 128,
  })
  imagePath: string;

  @ManyToOne(() => Article, (article) => article.photos, {
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'article_id', referencedColumnName: 'articleId' }])
  article: Article;
}

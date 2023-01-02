import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Article } from '../article/article.entity';
import { Feature } from '../feature/feature.entity';

@Index('category_pkey', ['categoryId'], { unique: true })
@Index('uq_category_image_path', ['imagePath'], { unique: true })
@Index('uq_category_name', ['name'], { unique: true })
@Entity('category')
export class Category {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'category_id' })
  categoryId: number;

  @Column({ name: 'name', type: 'character varying', unique: true, length: 32 })
  name: string;

  @Column({
    type: 'character varying',
    name: 'image_path',
    unique: true,
    length: 128,
  })
  imagePath: string;

  @OneToMany(() => Article, (article) => article.category)
  articles: Article[];

  @ManyToOne(() => Category, (category) => category.categories, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([
    { name: 'parent__category_id', referencedColumnName: 'categoryId' },
  ])
  parentCategory: Category;

  @OneToMany(() => Category, (category) => category.parentCategory)
  categories: Category[];

  @OneToMany(() => Feature, (feature) => feature.category)
  features: Feature[];
}

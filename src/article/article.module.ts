import { PhotoModule } from './../photo/photo.module';
import { forwardRef } from '@nestjs/common/utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { Article } from './article.entity';
import { ArticleFeature } from './article-feature.entity';
import { ArticlePrice } from './article-price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, ArticleFeature, ArticlePrice]),
    forwardRef(() => PhotoModule),
  ],
  providers: [ArticleService],
  controllers: [ArticleController],
})
export class ArticleModule {}

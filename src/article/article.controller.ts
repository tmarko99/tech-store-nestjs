import { ApiResponse } from './../shared/api-response';
import { AddArticleDto } from './dto/add-article.dto';
import { Article } from './article.entity';
import { Controller, Body, Post } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ArticleService } from './article.service';

@Controller('article')
@Crud({
  model: {
    type: Article,
  },
  params: {
    id: {
      field: 'articleId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      category: {
        eager: true,
      },
      photos: {
        eager: true,
      },
      articlePrices: {
        eager: true,
      },
      articleFeatures: {
        eager: true,
      },
      features: {
        eager: true,
      },
    },
  },
})
export class ArticleController {
  constructor(public service: ArticleService) {}

  @Post('/createFull')
  createFullArticle(
    @Body() addArticleDto: AddArticleDto,
  ): Promise<Article | ApiResponse> {
    return this.service.createFullArticle(addArticleDto);
  }
}

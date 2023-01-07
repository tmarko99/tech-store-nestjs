import { ApiResponse } from './../shared/api-response';
import { AddArticleDto } from './dto/add-article.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { ArticlePrice } from './article-price.entity';
import { ArticleFeature } from './article-feature.entity';

@Injectable()
export class ArticleService extends TypeOrmCrudService<Article> {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(ArticlePrice)
    private readonly articlePriceRepository: Repository<ArticlePrice>,
    @InjectRepository(ArticleFeature)
    private readonly articleFeatureRepository: Repository<ArticleFeature>,
  ) {
    super(articleRepository);
  }

  async createFullArticle(
    addArticleDto: AddArticleDto,
  ): Promise<Article | ApiResponse> {
    const { features, ...articleDto } = addArticleDto;
    const article = this.articleRepository.create(articleDto);

    const savedArticle = await this.articleRepository.save(article);

    const articlePrice = new ArticlePrice();
    articlePrice.articleId = savedArticle.articleId;
    articlePrice.price = addArticleDto.price;

    await this.articlePriceRepository.save(articlePrice);

    for (const feature of features) {
      const articleFeature = new ArticleFeature();
      articleFeature.articleId = savedArticle.articleId;
      articleFeature.featureId = feature.featureId;
      articleFeature.value = feature.value;

      await this.articleFeatureRepository.save(articleFeature);
    }

    return await this.articleRepository.findOne({
      where: {
        articleId: savedArticle.articleId,
      },
      relations: ['category', 'features', 'articleFeatures', 'articlePrices'],
    });
  }
}

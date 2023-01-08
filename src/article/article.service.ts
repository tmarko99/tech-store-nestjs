import { ApiResponse } from './../shared/api-response';
import { AddArticleDto } from './dto/add-article.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { ArticlePrice } from './article-price.entity';
import { ArticleFeature } from './article-feature.entity';
import { EditArticleDto } from './dto/edit-article.dto';

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

  async editFullArticle(
    articleId: number,
    editArticleDto: EditArticleDto,
  ): Promise<Article | ApiResponse> {
    const existingArticle = await this.articleRepository.findOne({
      where: {
        articleId: articleId,
      },
      relations: ['articlePrices', 'articleFeatures'],
    });

    if (!existingArticle) {
      return new ApiResponse('error', -5001, 'Article not found.');
    }

    existingArticle.name = editArticleDto.name;
    existingArticle.categoryId = editArticleDto.categoryId;
    existingArticle.excerpt = editArticleDto.excerpt;
    existingArticle.description = editArticleDto.description;
    existingArticle.status = editArticleDto.status;
    existingArticle.isPromoted = editArticleDto.isPromoted;

    const updatedArticle = await this.articleRepository.save(existingArticle);

    if (!updatedArticle) {
      return new ApiResponse(
        'error',
        -5002,
        'Could not save new article data.',
      );
    }

    const newPrice = Number(editArticleDto.price).toFixed(2);
    const lastPrice = Number(
      existingArticle.articlePrices[existingArticle.articlePrices.length - 1]
        .price,
    ).toFixed(2);

    if (newPrice !== lastPrice) {
      const newArticlePrice = new ArticlePrice();
      newArticlePrice.articleId = articleId;
      newArticlePrice.price = editArticleDto.price;

      const savedArticlePrice = await this.articlePriceRepository.save(
        newArticlePrice,
      );

      if (!savedArticlePrice) {
        return new ApiResponse(
          'error',
          -5003,
          'Could not save the new article price.',
        );
      }

      if (editArticleDto.features !== null) {
        await this.articleFeatureRepository.remove(
          existingArticle.articleFeatures,
        );
        for (const feature of editArticleDto.features) {
          const articleFeature = new ArticleFeature();
          articleFeature.articleId = articleId;
          articleFeature.featureId = feature.featureId;
          articleFeature.value = feature.value;

          await this.articleFeatureRepository.save(articleFeature);
        }
      }

      return await this.articleRepository.findOne({
        where: {
          articleId: articleId,
        },
        relations: ['category', 'features', 'articleFeatures', 'articlePrices'],
      });
    }
  }
}

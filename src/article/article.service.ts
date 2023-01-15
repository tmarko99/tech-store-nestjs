import { ApiResponse } from './../shared/api-response';
import { AddArticleDto } from './dto/add-article.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { In, Repository } from 'typeorm';
import { Article } from './article.entity';
import { ArticlePrice } from './article-price.entity';
import { ArticleFeature } from './article-feature.entity';
import { EditArticleDto } from './dto/edit-article.dto';
import { ArticleSearchDto } from './dto/article-search.dto';

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

  async search(articleSearchDto: ArticleSearchDto): Promise<Article[]> {
    const article = await this.articleRepository.createQueryBuilder('article');

    article.innerJoinAndSelect(
      'article.articlePrices',
      'articlePrices',
      'articlePrices.createdAt = (SELECT MAX(ap.created_at) FROM article_price AS ap WHERE ap.article_id = article.article_id)',
    );

    article.leftJoin('article.articleFeatures', 'articleFeatures');

    article.where('article.categoryId = :categoryId', {
      categoryId: articleSearchDto.categoryId,
    });

    if (articleSearchDto.keywords) {
      article.andWhere(
        '(article.name LIKE :keyword OR article.excerpt LIKE :keyword OR article.description LIKE :keyword)',
        { keyword: '%' + articleSearchDto.keywords.trim() + '%' },
      );
    }

    if (articleSearchDto.priceMin) {
      article.andWhere('articlePrices.price >= :min', {
        min: articleSearchDto.priceMin,
      });
    }

    if (articleSearchDto.priceMax) {
      article.andWhere('articlePrices.price <= :max', {
        max: articleSearchDto.priceMax,
      });
    }

    if (articleSearchDto.features && articleSearchDto.features.length > 0) {
      for (const feature of articleSearchDto.features) {
        article.andWhere(
          'articleFeatures.featureId = :featureId AND articleFeatures.value IN (:featureValues)',
          { featureId: feature.featureId, featureValues: feature.values },
        );
      }
    }

    let orderBy = 'article.name';
    let orderDirection: 'ASC' | 'DESC' = 'ASC';

    if (articleSearchDto.orderBy) {
      orderBy = articleSearchDto.orderBy;

      if (orderBy === 'price') {
        orderBy = 'articleFeatures.price';
      }

      if (orderBy === 'name') {
        orderBy = 'article.name';
      }
    }

    if (articleSearchDto.orderDirection) {
      orderDirection = articleSearchDto.orderDirection;
    }

    article.orderBy(orderBy, orderDirection);

    let page = 0;
    let itemsPerPage: 5 | 10 | 25 | 50 | 75 = 25;

    if (articleSearchDto.page) {
      page = articleSearchDto.page;
    }

    if (articleSearchDto.itemsPerPage) {
      itemsPerPage = articleSearchDto.itemsPerPage;
    }

    article.skip(page * itemsPerPage);
    article.take(itemsPerPage);

    const articleIds = await (
      await article.getMany()
    ).map((article) => article.articleId);

    return await this.articleRepository.find({
      where: {
        articleId: In(articleIds),
      },
      relations: [
        'category',
        'features',
        'articleFeatures',
        'articlePrices',
        'photos',
      ],
    });
  }
}

/* eslint-disable prettier/prettier */
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { ArticleSearchFeatureComponentDto } from './article-search-feature.component.dto';

export class ArticleSearchDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Length(2, 128)
  keywords: string;

  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @IsPositive()
  categoryId: number;

  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @IsPositive()
  priceMin: number;

  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @IsPositive()
  priceMax: number;

  features: ArticleSearchFeatureComponentDto[];

  @IsOptional()
  @IsIn(['name', 'price'])
  orderBy: 'name' | 'price';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDirection: 'ASC' | 'DESC';

  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @IsPositive()
  page: number;

  @IsOptional()
  @IsIn([5, 10, 25, 50, 75])
  itemsPerPage: 5 | 10 | 25 | 50 | 75;
}

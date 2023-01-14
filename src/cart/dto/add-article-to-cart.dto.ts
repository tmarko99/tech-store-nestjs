/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class AddArticleToCartDto {
  articleId: number;
  
  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @IsPositive()
  quantity: number;
}

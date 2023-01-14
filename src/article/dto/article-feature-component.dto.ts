/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, Length } from "class-validator";

export class ArticleFeatureComponentDto {
  featureId: number;
  
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  value: string;
}

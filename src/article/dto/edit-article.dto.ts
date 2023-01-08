/* eslint-disable prettier/prettier */
export class EditArticleDto {
  name: string;
  categoryId: number;
  excerpt: string;
  description: string;
  price: number;
  status: 'available' | 'visible' | 'hidden';
  isPromoted: 0 | 1;
  features: {
    featureId: number;
    value: string;
  }[] | null;
}

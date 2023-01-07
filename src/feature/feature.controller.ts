import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Feature } from './feature.entity';
import { FeatureService } from './feature.service';

@Controller('api/feature')
@Crud({
  model: {
    type: Feature,
  },
  params: {
    id: {
      field: 'featureId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      articleFeatures: {
        eager: false,
      },
      category: {
        eager: true,
      },
      articles: {
        eager: false,
      },
    },
  },
})
export class FeatureController {
  constructor(private readonly service: FeatureService) {}
}

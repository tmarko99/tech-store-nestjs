import { Controller, UseGuards } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Roles } from '../shared/decorators/roles.decorator';
import { RolesGuard } from '../shared/guards/roles.guards';
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
  routes: {
    only: [
      'createOneBase',
      'createManyBase',
      'getManyBase',
      'getOneBase',
      'updateOneBase',
    ],
    createOneBase: {
      decorators: [UseGuards(RolesGuard), Roles('administrator')],
    },
    createManyBase: {
      decorators: [UseGuards(RolesGuard), Roles('administrator')],
    },
    getManyBase: {
      decorators: [UseGuards(RolesGuard), Roles('administrator', 'user')],
    },
    getOneBase: {
      decorators: [UseGuards(RolesGuard), Roles('administrator', 'user')],
    },
    updateOneBase: {
      decorators: [UseGuards(RolesGuard), Roles('administrator')],
    },
  },
})
export class FeatureController {
  constructor(private readonly service: FeatureService) {}
}

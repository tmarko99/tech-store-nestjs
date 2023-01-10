import { Controller, UseGuards } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Roles } from '../shared/decorators/roles.decorator';
import { RolesGuard } from '../shared/guards/roles.guards';
import { Category } from './category.entity';
import { CategoryService } from './category.service';

@Controller('api/category')
@Crud({
  model: {
    type: Category,
  },
  params: {
    id: {
      field: 'categoryId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      categories: {
        eager: true,
      },
      parentCategory: {
        eager: false,
      },
      features: {
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
export class CategoryController {
  constructor(public service: CategoryService) {}
}

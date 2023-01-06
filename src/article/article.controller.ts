import { PhotoService } from './../photo/photo.service';
import { ApiResponse } from './../shared/api-response';
import { AddArticleDto } from './dto/add-article.dto';
import { Article } from './article.entity';
import {
  Controller,
  Body,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  Inject,
} from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ArticleService } from './article.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Photo } from '../photo/photo.entity';
import { StorageConfig } from '../shared/config/storage.config';

@Controller('api/article')
@Crud({
  model: {
    type: Article,
  },
  params: {
    id: {
      field: 'articleId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      category: {
        eager: true,
      },
      photos: {
        eager: true,
      },
      articlePrices: {
        eager: true,
      },
      articleFeatures: {
        eager: true,
      },
      features: {
        eager: true,
      },
    },
  },
})
export class ArticleController {
  constructor(
    public service: ArticleService,
    @Inject(PhotoService)
    private readonly photoService: PhotoService,
  ) {}

  @Post('/createFull')
  createFullArticle(
    @Body() addArticleDto: AddArticleDto,
  ): Promise<Article | ApiResponse> {
    return this.service.createFullArticle(addArticleDto);
  }

  @Post('/:id/uploadPhoto')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: StorageConfig.destination,
        filename: (req, file, callback) => {
          const originalFileName = file.originalname;

          const normalizedFileName = originalFileName.replace(/\s+/g, '-');
          const currentTime = new Date();
          let datePart = '';
          datePart += currentTime.getFullYear().toString();
          datePart += (currentTime.getMonth() + 1).toString();
          datePart += currentTime.getDate().toString();

          const generateRandomNumber = (min, max) =>
            Math.floor(min + Math.random() * (max - min + 1));

          let randomNumber = '';

          Array.from(
            { length: 10 },
            () => (randomNumber += generateRandomNumber(1, 10)),
          );

          let fileName = datePart + '-' + randomNumber + '-' + normalizedFileName;

          fileName = fileName.toLocaleLowerCase();

          callback(null, fileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.toLowerCase().match(/\.(jp|pn)g$/)) {
          callback(new Error('Bad file extensions!'), false);
          return;
        }

        if (
          !(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))
        ) {
          callback(new Error('Bad file content!'), false);
          return;
        }

        callback(null, true);
      },
      limits: {
        files: 1,
        fieldSize: StorageConfig.maxSize,
      },
    }),
  )
  async uploadPhoto(
    @Param('id') articleId: number,
    @UploadedFile() photo,
  ): Promise<ApiResponse | Photo> {
    const newPhoto: Photo = new Photo();
    newPhoto.articleId = articleId;
    newPhoto.imagePath = photo.filename;

    const savedPhoto = await this.photoService.add(newPhoto);

    if (!savedPhoto) {
      return new ApiResponse('error', -4001);
    }

    return savedPhoto;
  }
}

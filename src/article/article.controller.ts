import { PhotoService } from './../photo/photo.service';
import { ApiResponse } from './../shared/api-response';
import { AddArticleDto } from './dto/add-article.dto';
import { Article } from './article.entity';
import {
  Controller,
  Body,
  Post,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  Inject,
  Req,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ArticleService } from './article.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Photo } from '../photo/photo.entity';
import { StorageConfig } from '../shared/config/storage.config';
import * as fileType from 'file-type';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { EditArticleDto } from './dto/edit-article.dto';
import { RolesGuard } from 'src/shared/guards/roles.guards';
import { Roles } from 'src/shared/decorators/roles.decorator';

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
  routes: {
    exclude: ['updateOneBase', 'replaceOneBase', 'deleteOneBase'],
  },
})
export class ArticleController {
  constructor(
    public service: ArticleService,
    @Inject(PhotoService)
    private readonly photoService: PhotoService,
  ) {}

  @Post('/createFull')
  @UseGuards(RolesGuard)
  @Roles('administrator')
  createFullArticle(
    @Body() addArticleDto: AddArticleDto,
  ): Promise<Article | ApiResponse> {
    return this.service.createFullArticle(addArticleDto);
  }

  @Patch('/:id')
  @UseGuards(RolesGuard)
  @Roles('administrator')
  editFullArticle(
    @Param('id') articleId: number,
    @Body() editArticleDto: EditArticleDto,
  ): Promise<Article | ApiResponse> {
    return this.service.editFullArticle(articleId, editArticleDto);
  }

  @Post('/:id/uploadPhoto')
  @UseGuards(RolesGuard)
  @Roles('administrator')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: StorageConfig.photo.destination,
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

          let fileName =
            datePart + '-' + randomNumber + '-' + normalizedFileName;

          fileName = fileName.toLocaleLowerCase();

          callback(null, fileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.toLowerCase().match(/\.(jp|pn)g$/)) {
          req.fileFilterError = 'Bad file extension.';
          callback(null, false);
          return;
        }

        if (
          !(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))
        ) {
          req.fileFilterError = 'Bad file content.';
          callback(null, false);
          return;
        }

        callback(null, true);
      },
      limits: {
        files: 1,
        fileSize: StorageConfig.photo.maxSize,
      },
    }),
  )
  async uploadPhoto(
    @Param('id') articleId: number,
    @UploadedFile() photo,
    @Req() req,
  ): Promise<ApiResponse | Photo> {
    if (req.fileFilterError) {
      return new ApiResponse('error', -4002, req.fileFilterError);
    }

    if (!photo) {
      return new ApiResponse('error', -4002, 'File not uploaded.');
    }

    const fileTypeResult = await fileType.fromFile(photo.path);

    if (!fileTypeResult) {
      fs.unlinkSync(photo.path);
      return new ApiResponse('error', -4002, 'Cannot detect file type.');
    }

    const realMimeType = fileTypeResult.mime;

    if (!(realMimeType.includes('jpeg') || realMimeType.includes('png'))) {
      fs.unlinkSync(photo.path);
      return new ApiResponse('error', -4002, 'Bad file content type.');
    }

    await this.createResizedImage(photo, StorageConfig.photo.resize.thumb);
    await this.createResizedImage(photo, StorageConfig.photo.resize.small);

    const newPhoto: Photo = new Photo();
    newPhoto.articleId = articleId;
    newPhoto.imagePath = photo.filename;

    const savedPhoto = await this.photoService.add(newPhoto);

    if (!savedPhoto) {
      return new ApiResponse('error', -4001);
    }

    return savedPhoto;
  }

  @Delete('/:articleId/deletePhoto/:photoId')
  @UseGuards(RolesGuard)
  @Roles('administrator')
  async deletePhoto(
    @Param('articleId') articleId: number,
    @Param('photoId') photoId: number,
  ) {
    const photo = await this.photoService.findOne({
      where: {
        articleId: articleId,
        photoId: photoId,
      },
    });

    if (!photo) {
      return new ApiResponse('error', -4004, 'Photo not found');
    }

    try {
      fs.unlinkSync(StorageConfig.photo.destination + photo.imagePath);
      fs.unlinkSync(
        StorageConfig.photo.destination +
          StorageConfig.photo.resize.thumb.directory +
          photo.imagePath,
      );
      fs.unlinkSync(
        StorageConfig.photo.destination +
          StorageConfig.photo.resize.small.directory +
          photo.imagePath,
      );
    } catch (e) {}

    const deleteResult = await this.photoService.deleteById(photoId);

    if (!deleteResult.affected) {
      return new ApiResponse('error', -4004, 'Photo not found');
    }

    return new ApiResponse('ok', 0, 'One photo deleted');
  }

  private async createResizedImage(photo, resizeSettings) {
    const originalFilePath = photo.path;
    const fileName = photo.fileName;

    const destinationFilePath =
      StorageConfig.photo.destination + resizeSettings.directory + fileName;

    await sharp(originalFilePath)
      .resize({
        fit: 'cover',
        width: resizeSettings.width,
        height: resizeSettings.height,
      })
      .toFile(destinationFilePath);
  }
}

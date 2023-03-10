import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdministratorModule } from './administrator/administrator.module';
import { ArticleModule } from './article/article.module';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { FeatureModule } from './feature/feature.module';
import { OrderModule } from './order/order.module';
import { PhotoModule } from './photo/photo.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './shared/middlewares/auth.middleware';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: `smtps://${configService.get(
          'MAIL_USERNAME',
        )}:${configService.get('MAIL_PASSWORD')}@${configService.get(
          'HOSTNAME',
        )}`,
        defaults: {
          from: configService.get('SENDER_EMAIL'),
        },
      }),
      inject: [ConfigService],
    }),
    AdministratorModule,
    ArticleModule,
    CartModule,
    CategoryModule,
    FeatureModule,
    OrderModule,
    PhotoModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('auth/**').forRoutes('api/**');
  }
}

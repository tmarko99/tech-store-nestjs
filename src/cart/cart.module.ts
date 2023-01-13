import { forwardRef } from '@nestjs/common/utils';
import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartArticle } from './cart-article.entity';
import { Article } from '../article/article.entity';
import { Order } from '../order/order.entity';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartArticle, Article, Order]),
    forwardRef(() => OrderModule),
  ],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}

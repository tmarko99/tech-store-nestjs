import { Cart } from './../cart/cart.entity';
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderMailerService } from './order-mailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Cart])],
  providers: [OrderService, OrderMailerService],
  controllers: [OrderController],
  exports: [OrderService, OrderMailerService],
})
export class OrderModule {}

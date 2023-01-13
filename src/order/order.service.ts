import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../cart/cart.entity';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { ApiResponse } from '../shared/api-response';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderService: Repository<Order>,
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
  ) {}

  async createOrder(cartId: number): Promise<Order | ApiResponse> {
    const order = await this.orderService.findOne({
      where: {
        cartId: cartId,
      },
    });

    if (order) {
      return new ApiResponse(
        'error',
        -7001,
        'An order for this card has already been made.',
      );
    }

    const cart = await this.cartRepository.findOne({
      where: {
        cartId: cartId,
      },
      relations: ['cartArticles'],
    });

    if (!cart) {
      return new ApiResponse('error', -7002, 'No such cart found.');
    }

    if (cart.cartArticles.length === 0) {
      return new ApiResponse('error', -7003, 'This cart is empty.');
    }

    const newOrder = new Order();
    newOrder.cartId = cartId;

    const savedOrder = await this.orderService.save(newOrder);

    return await this.orderService.findOne({
      where: {
        orderId: savedOrder.orderId,
      },
      relations: [
        'cart',
        'cart.user',
        'cart.cartArticles',
        'cart.cartArticles.article',
        'cart.cartArticles.article.category',
        'cart.cartArticles.article.articlePrices',
      ],
    });
  }
}

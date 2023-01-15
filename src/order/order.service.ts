import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../cart/cart.entity';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { ApiResponse } from '../shared/api-response';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
  ) {}

  async createOrder(cartId: number): Promise<Order | ApiResponse> {
    const order = await this.orderRepository.findOne({
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

    const savedOrder = await this.orderRepository.save(newOrder);

    return await this.getById(savedOrder.orderId);
  }

  async getById(orderId: number): Promise<Order | ApiResponse> {
    const order = await this.orderRepository.findOne({
      where: {
        orderId: orderId,
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

    if (!order) {
      return new ApiResponse('error', -9001, 'No such order found.');
    }

    return order;
  }

  async changeStatus(
    orderId: number,
    changeOrderStatusDto: ChangeOrderStatusDto,
  ): Promise<Order | ApiResponse> {
    const order = await this.getById(orderId);

    order.status = changeOrderStatusDto.newStatus;

    if (order instanceof Order) {
      await this.orderRepository.save(order);
    }

    return this.getById(orderId);
  }
}

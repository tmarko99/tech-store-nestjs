import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Cart } from './cart.entity';
import { Repository } from 'typeorm';
import { CartArticle } from './cart-article.entity';
import { Article } from '../article/article.entity';
import { Order } from '../order/order.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(CartArticle)
    private readonly cartArticleRepository: Repository<CartArticle>,
  ) {}

  async getLastActiveCartByUserId(userId: number): Promise<Cart | null> {
    const carts = await this.cartRepository.find({
      where: {
        userId: userId,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 1,
      relations: ['order'],
    });

    if (!carts || carts.length === 0) {
      return null;
    }

    const cart = carts[0];

    if (cart.order !== null) {
      return null;
    }

    return cart;
  }

  async createNewCartForUser(userId: number): Promise<Cart> {
    const newCart = new Cart();
    newCart.userId = userId;

    return await this.cartRepository.save(newCart);
  }

  async addArticleToCart(
    cartId: number,
    articleId: number,
    quantity: number,
  ): Promise<Cart> {
    let record = await this.cartArticleRepository.findOne({
      where: {
        cartId: cartId,
        articleId: articleId,
      },
    });

    if (!record) {
      record = new CartArticle();
      record.cartId = cartId;
      record.articleId = articleId;
      record.quantity = quantity;
    } else {
      record.quantity += quantity;
    }

    await this.cartArticleRepository.save(record);

    return this.getById(cartId);
  }

  async getById(cartId: number): Promise<Cart> {
    return await this.cartRepository.findOne({
      where: {
        cartId: cartId,
      },
      relations: [
        'user',
        'cartArticles',
        'cartArticles.article',
        'cartArticles.article.category',
        'cartArticles.article.articlePrices',
      ],
    });
  }

  async changeQuantity(
    cartId: number,
    articleId: number,
    newQuantity: number,
  ): Promise<Cart> {
    const record = await this.cartArticleRepository.findOne({
      where: {
        cartId: cartId,
        articleId: articleId,
      },
    });

    if (record) {
      record.quantity = newQuantity;

      if (record.quantity === 0) {
        await this.cartArticleRepository.delete(record.cartArticleId);
      } else {
        await this.cartArticleRepository.save(record);
      }
    }

    return await this.getById(cartId);
  }
}

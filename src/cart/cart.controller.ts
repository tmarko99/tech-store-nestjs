import { forwardRef } from '@nestjs/common/utils';
import { Roles } from './../shared/decorators/roles.decorator';
import { RolesGuard } from './../shared/guards/roles.guards';
import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './cart.entity';
import { CurrentUser } from '../shared/decorators/current-user';
import { AddArticleToCartDto } from './dto/add-article-to-cart.dto';
import { EditArticleInCartDto } from './dto/edit-article-in-cart.dto';
import { OrderService } from '../order/order.service';
import { Order } from '../order/order.entity';
import { ApiResponse } from '../shared/api-response';
import { OrderMailerService } from '../order/order-mailer.service';

@Controller('api/cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    @Inject(forwardRef(() => OrderMailerService))
    private readonly orderMailerService: OrderMailerService,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('user')
  async getCurrentCart(@CurrentUser() currentUser): Promise<Cart> {
    return this.getActiveCartForUser(currentUser.id);
  }

  @Post('/addToCart')
  @UseGuards(RolesGuard)
  @Roles('user')
  async addToCart(
    @Body() addArticleToCartDto: AddArticleToCartDto,
    @CurrentUser() currentUser,
  ): Promise<Cart> {
    const cart = await this.getActiveCartForUser(currentUser.id);

    return this.cartService.addArticleToCart(
      cart.cartId,
      addArticleToCartDto.articleId,
      addArticleToCartDto.quantity,
    );
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles('user')
  async changeQuantity(
    @Body() editArticleInCartDto: EditArticleInCartDto,
    @CurrentUser() currentUser,
  ): Promise<Cart> {
    const cart = await this.getActiveCartForUser(currentUser.id);

    return this.cartService.changeQuantity(
      cart.cartId,
      editArticleInCartDto.articleId,
      editArticleInCartDto.quantity,
    );
  }

  @Post('/makeOrder')
  @UseGuards(RolesGuard)
  @Roles('user')
  async makeOrder(@CurrentUser() currentUser): Promise<Order | ApiResponse> {
    const cart = await this.getActiveCartForUser(currentUser.id);

    const order = await this.orderService.createOrder(cart.cartId);

    if (order instanceof ApiResponse) {
      return order;
    }

    await this.orderMailerService.sendOrderEmail(order);

    return order;
  }

  private async getActiveCartForUser(userId: number): Promise<Cart> {
    let cart = await this.cartService.getLastActiveCartByUserId(userId);

    if (!cart) {
      cart = await this.cartService.createNewCartForUser(userId);
    }

    return this.cartService.getById(cart.cartId);
  }
}

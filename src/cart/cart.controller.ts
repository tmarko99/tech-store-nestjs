import { Roles } from './../shared/decorators/roles.decorator';
import { RolesGuard } from './../shared/guards/roles.guards';
import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './cart.entity';
import { CurrentUser } from '../shared/decorators/current-user';
import { AddArticleToCartDto } from './dto/add-article-to-cart.dto';
import { EditArticleInCartDto } from './dto/edit-article-in-cart.dto';

@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

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

  private async getActiveCartForUser(userId: number): Promise<Cart> {
    let cart = await this.cartService.getLastActiveCartByUserId(userId);

    if (!cart) {
      cart = await this.cartService.createNewCartForUser(userId);
    }

    return this.cartService.getById(cart.cartId);
  }
}

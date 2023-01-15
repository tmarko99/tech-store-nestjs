/* eslint-disable prettier/prettier */
import { CartArticle } from './../cart/cart-article.entity';
import { Injectable } from '@nestjs/common';
import { Order } from './order.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class OrderMailerService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOrderEmail(order: Order) {
    await this.mailerService.sendMail({
      to: order.cart.user.email,
      subject: 'Order details',
      encoding: 'UTF-8',
      html: this.makeOrderHtml(order),
    });
  }

  private makeOrderHtml(order: Order): string {
    const total = order.cart.cartArticles.reduce(
      (sum, currCartArticle: CartArticle) => {
        return (
          sum +
          currCartArticle.quantity *
            currCartArticle.article.articlePrices[
              currCartArticle.article.articlePrices.length - 1
            ].price
        );
      },
      0,
    );

    return `<p>Thank you for order!</p>
            <p>Order details: </p>
            <ul>
                ${order.cart.cartArticles
                  .map((cartArticle) => {
                    return `<li>
                    ${cartArticle.article.name} X
                    ${cartArticle.quantity}
                    </li>`;
                  })
                  .join('')}
            <ul>
            <p>Total: ${total.toFixed(2)} EUR.</p>`;
  }
}

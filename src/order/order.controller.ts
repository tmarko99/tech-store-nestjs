import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { RolesGuard } from './../shared/guards/roles.guards';
import { ApiResponse } from './../shared/api-response';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Roles } from '../shared/decorators/roles.decorator';

@Controller('api/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/:id')
  @UseGuards(RolesGuard)
  @Roles('administrator')
  get(@Param('id') id: number): Promise<Order | ApiResponse> {
    return this.orderService.getById(id);
  }

  @Patch('/:id')
  @UseGuards(RolesGuard)
  @Roles('administrator')
  changeStatus(
    @Param('id') id: number,
    @Body() changeOrderStatusDto: ChangeOrderStatusDto,
  ): Promise<Order | ApiResponse> {
    return this.orderService.changeStatus(id, changeOrderStatusDto);
  }
}

import { RolesGuard } from './../shared/guards/roles.guards';
import { ApiResponse } from './../shared/api-response';
import { Administrator } from './administrator.entity';
import { AdministratorService } from './administrator.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AddAdministratorDto } from './dto/add-administrator.dto';
import { EditAdministratorDto } from './dto/edit-administrator.dto';
import { Roles } from '../shared/decorators/roles.decorator';

@Controller('api/administrator')
@UseGuards(RolesGuard)
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Get()
  @Roles('administrator')
  getAll(): Promise<Administrator[]> {
    return this.administratorService.getAll();
  }

  @Get('/:id')
  @Roles('administrator')
  getById(@Param('id') id: number): Promise<Administrator | ApiResponse> {
    return this.administratorService.getById(id);
  }

  @Post()
  @Roles('administrator')
  addAdministrator(
    @Body() addAdministratorDto: AddAdministratorDto,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.addAdministrator(addAdministratorDto);
  }

  @Put('/:id')
  @Roles('administrator')
  editAdministrator(
    @Param('id') id: number,
    @Body() editAdministratorDto: EditAdministratorDto,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.editAdministrator(
      id,
      editAdministratorDto,
    );
  }
}

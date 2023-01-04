import { ApiResponse } from './../shared/api-response';
import { Administrator } from './administrator.entity';
import { AdministratorService } from './administrator.service';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AddAdministratorDto } from './dto/add-administrator.dto';
import { EditAdministratorDto } from './dto/edit-administrator.dto';

@Controller('api/administrator')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Get()
  getAll(): Promise<Administrator[]> {
    return this.administratorService.getAll();
  }

  @Get('/:id')
  getById(@Param('id') id: number): Promise<Administrator | ApiResponse> {
    return this.administratorService.getById(id);
  }

  @Post()
  addAdministrator(
    @Body() addAdministratorDto: AddAdministratorDto,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.addAdministrator(addAdministratorDto);
  }

  @Put('/:id')
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

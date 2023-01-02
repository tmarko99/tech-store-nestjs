import { Administrator } from './administrator.entity';
import { AdministratorService } from './administrator.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('administrator')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Get()
  getAll(): Promise<Administrator[]> {
    return this.administratorService.getAll();
  }

  @Get('/:id')
  getById(@Param('id') id: number): Promise<Administrator> {
    return this.administratorService.getById(id);
  }
}

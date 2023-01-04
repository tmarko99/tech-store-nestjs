import { Administrator } from './administrator.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { AdministratorController } from './administrator.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Administrator])],
  providers: [AdministratorService],
  controllers: [AdministratorController],
  exports: [AdministratorService],
})
export class AdministratorModule {}

import { AdministratorModule } from './../administrator/administrator.module';
import { forwardRef } from '@nestjs/common/utils';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [forwardRef(() => AdministratorModule)],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

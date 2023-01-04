import { LoginResponseDto } from './dto/login-response.dto';
import { ApiResponse } from './../shared/api-response';
import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAdministratorDto } from './dto/login-administrator.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async doLogin(
    @Body() loginAdministratorDto: LoginAdministratorDto,
    @Req() request: Request,
  ): Promise<ApiResponse | LoginResponseDto> {
    const administrator = await this.authService.findAdministrator(
      loginAdministratorDto.username,
    );

    if (!administrator) {
      return new Promise((resolve) => resolve(new ApiResponse('error', -3001)));
    }

    const passwordValid = await this.authService.validateAdministratorPassword(
      loginAdministratorDto.password,
      administrator.passwordHash,
    );

    if (!passwordValid) {
      return new Promise((resolve) => resolve(new ApiResponse('error', -3002)));
    }

    const ip = request.ip.toString();
    const ua = request.headers['user-agent'];

    const token = await this.authService.generateJwt(
      administrator.username,
      ip,
      ua,
    );

    const responseObject = new LoginResponseDto(
      administrator.administratorId,
      administrator.username,
      token,
    );

    return new Promise((resolve) => resolve(responseObject));
  }
}

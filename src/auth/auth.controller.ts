import { forwardRef } from '@nestjs/common/utils';
import { LoginResponseDto } from './dto/login-response.dto';
import { ApiResponse } from './../shared/api-response';
import { Controller, Post, Body, Req, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAdministratorDto } from './dto/login-administrator.dto';
import { Request } from 'express';
import { UserRegistrationDto } from './dto/user-registration.dto';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

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

  @Post('user/register')
  async registerUser(@Body() userRegistrationDto: UserRegistrationDto) {
    return await this.userService.registerUser(userRegistrationDto);
  }
}

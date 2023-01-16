import { UserToken } from './../user/user-token.entity';
import { ConfigService } from '@nestjs/config';
import { forwardRef } from '@nestjs/common/utils';
import { LoginResponseDto } from './dto/login-response.dto';
import { ApiResponse } from './../shared/api-response';
import {
  Controller,
  Post,
  Body,
  Req,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAdministratorDto } from './dto/login-administrator.dto';
import { Request } from 'express';
import { UserRegistrationDto } from './dto/user-registration.dto';
import { UserService } from '../user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { UserRefreshTokenDto } from './dto/user-refresh-token.dto';
import { JwtDataDto } from './dto/jwt-data.dto';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Post('administrator/login')
  async doAdministratorLogin(
    @Body() loginAdministratorDto: LoginAdministratorDto,
    @Req() request: Request,
  ): Promise<ApiResponse | LoginResponseDto> {
    const administrator = await this.authService.findAdministrator(
      loginAdministratorDto.username,
    );

    if (!administrator) {
      return new Promise((resolve) => resolve(new ApiResponse('error', -3001)));
    }

    const passwordValid = await this.authService.validatePassword(
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
      'administrator',
      ip,
      ua,
    );

    const refreshToken = await this.authService.generateJwtRefreshToken(
      administrator.username,
      'administrator',
      ip,
      ua,
    );

    await this.userService.addToken(
      administrator.administratorId,
      refreshToken,
      this.authService.getDatabaseDateFormat(
        this.authService.getIsoDate(60 * 60 * 24 * 31),
      ),
    );

    const responseObject = new LoginResponseDto(
      administrator.administratorId,
      administrator.username,
      token,
      refreshToken,
      this.authService.getDatabaseDateFormat(
        this.authService.getIsoDate(60 * 60 * 24 * 31),
      ),
    );

    return new Promise((resolve) => resolve(responseObject));
  }

  @Post('user/login')
  async doUserLogin(
    @Body() loginUserDto: LoginUserDto,
    @Req() request: Request,
  ): Promise<ApiResponse | LoginResponseDto> {
    const user = await this.authService.findUser(loginUserDto.email);

    if (!user) {
      return new Promise((resolve) => resolve(new ApiResponse('error', -3001)));
    }

    const passwordValid = await this.authService.validatePassword(
      loginUserDto.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      return new Promise((resolve) => resolve(new ApiResponse('error', -3002)));
    }

    const ip = request.ip.toString();
    const ua = request.headers['user-agent'];

    const token = await this.authService.generateJwt(
      user.email,
      'user',
      ip,
      ua,
    );

    const refreshToken = await this.authService.generateJwtRefreshToken(
      user.email,
      'user',
      ip,
      ua,
    );

    await this.userService.addToken(
      user.userId,
      refreshToken,
      this.authService.getDatabaseDateFormat(
        this.authService.getIsoDate(60 * 60 * 24 * 31),
      ),
    );

    const responseObject = new LoginResponseDto(
      user.userId,
      user.email,
      token,
      refreshToken,
      this.authService.getIsoDate(
        this.authService.getDatePlus(60 * 60 * 24 * 31),
      ),
    );

    return new Promise((resolve) => resolve(responseObject));
  }

  @Post('user/refresh')
  async userTokenRefresh(
    @Req() req: Request,
    @Body() userRefreshTokenDto: UserRefreshTokenDto,
  ): Promise<LoginResponseDto | ApiResponse> {
    const userToken = await this.userService.getUserToken(
      userRefreshTokenDto.token,
    );

    if (userToken instanceof UserToken) {
      let jwtRefreshData: JwtDataDto;

      try {
        jwtRefreshData = jwt.verify(
          userRefreshTokenDto.token,
          this.configService.get('JWT_SECRET'),
        );
      } catch (e) {
        throw new UnauthorizedException('Bad token found');
      }

      if (!jwtRefreshData) {
        throw new UnauthorizedException('Bad token found');
      }

      if (jwtRefreshData.ip !== req.ip.toString()) {
        throw new UnauthorizedException('Bad token found');
      }

      if (jwtRefreshData.ua !== req.headers['user-agent']) {
        throw new UnauthorizedException('Bad token found');
      }

      const jwtData = new JwtDataDto(
        jwtRefreshData.id,
        jwtRefreshData.identity,
        jwtRefreshData.role,
        this.authService.getDatePlus(60 * 5),
        jwtRefreshData.ip,
        jwtRefreshData.ua,
      );

      const token = jwt.sign(
        JSON.parse(JSON.stringify(jwtData)),
        this.configService.get('JWT_SECRET'),
      );

      const responseObject = new LoginResponseDto(
        jwtData.id,
        jwtData.identity,
        token,
        userRefreshTokenDto.token,
        this.authService.getIsoDate(jwtRefreshData.exp),
      );

      return responseObject;
    } else {
      return userToken;
    }
  }

  @Post('user/register')
  registerUser(@Body() userRegistrationDto: UserRegistrationDto) {
    return this.userService.registerUser(userRegistrationDto);
  }
}

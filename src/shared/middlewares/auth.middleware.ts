/* eslint-disable prettier/prettier */
import { JwtDataDto } from '../../auth/dto/jwt-data.dto';
import { AdministratorService } from './../../administrator/administrator.service';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { UserService } from './../../user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers['authorization']) {
      throw new UnauthorizedException('Token not found');
    }

    const token = req.headers['authorization'].substring(7);

    let jwtData: JwtDataDto;

    try {
        jwtData = jwt.verify(
            token,
            this.configService.get('JWT_SECRET'),
        );
    } catch(e) {
        throw new UnauthorizedException('Bad token found');
    }

    if (!jwtData) {
      throw new UnauthorizedException('Bad token found');
    }

    if (jwtData.ip !== req.ip.toString()) {
      throw new UnauthorizedException('Bad token found');
    }

    if (jwtData.ua !== req.headers['user-agent']) {
      throw new UnauthorizedException('Bad token found');
    }

    if (jwtData.role === 'administrator') {
        const administrator = await this.administratorService.getById(
            jwtData.id,
        );
      
          if (!administrator) {
            throw new UnauthorizedException('Account not found');
        }
    } else if (jwtData.role === 'user') {
        const user = await this.userService.getById(
            jwtData.id,
        );
      
          if (!user) {
            throw new UnauthorizedException('Account not found');
        }
    }

    const currentTime = new Date().getTime() / 1000;

    if (currentTime >= jwtData.exp) {
      throw new UnauthorizedException('The token has expired');
    }

    req.token = jwtData;

    next();
  }
}

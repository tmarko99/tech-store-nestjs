import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { Administrator } from '../administrator/administrator.entity';
import { AdministratorService } from '../administrator/administrator.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtDataAdministratorDto } from './dto/jwt-data-administrator.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => AdministratorService))
    private readonly administratorService: AdministratorService,
    private configService: ConfigService,
  ) {}

  async findAdministrator(username: string): Promise<Administrator | null> {
    return await this.administratorService.getByUsername(username);
  }

  async validateAdministratorPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async generateJwt(username: string, ip: string, ua: string) {
    const adiminstrator = await this.findAdministrator(username);

    const currentTime = new Date();
    currentTime.setDate(currentTime.getDate() + 14);

    const expDate = currentTime.getTime() / 1000;

    const jwtData = new JwtDataAdministratorDto(
      adiminstrator.administratorId,
      adiminstrator.username,
      expDate,
      ip,
      ua,
    );

    return jwt.sign(
      JSON.parse(JSON.stringify(jwtData)),
      this.configService.get('JWT_SECRET'),
    );
  }
}

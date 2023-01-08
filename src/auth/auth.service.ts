import { UserService } from './../user/user.service';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { Administrator } from '../administrator/administrator.entity';
import { AdministratorService } from '../administrator/administrator.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtDataDto } from './dto/jwt-data.dto';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => AdministratorService))
    private readonly administratorService: AdministratorService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}

  async findAdministrator(username: string): Promise<Administrator | null> {
    return await this.administratorService.getByUsername(username);
  }

  async findUser(email: string): Promise<User | null> {
    return await this.userService.getByEmail(email);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async generateJwt(
    identity: string,
    role: 'administrator' | 'user',
    ip: string,
    ua: string,
  ) {
    let userOrAdministrator;
    let jwtData;
    const currentTime = new Date();
    currentTime.setDate(currentTime.getDate() + 14);

    const expDate = currentTime.getTime() / 1000;
    if (role === 'administrator') {
      userOrAdministrator = await this.findAdministrator(identity);
      jwtData = new JwtDataDto(
        userOrAdministrator.administratorId,
        userOrAdministrator.username,
        role,
        expDate,
        ip,
        ua,
      );
    } else if (role === 'user') {
      userOrAdministrator = await this.findUser(identity);
      jwtData = new JwtDataDto(
        userOrAdministrator.userId,
        userOrAdministrator.email,
        role,
        expDate,
        ip,
        ua,
      );
    }

    return jwt.sign(
      JSON.parse(JSON.stringify(jwtData)),
      this.configService.get('JWT_SECRET'),
    );
  }
}

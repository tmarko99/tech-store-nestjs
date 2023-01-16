import { UserToken } from './user-token.entity';
import { ApiResponse } from './../shared/api-response';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRegistrationDto } from '../auth/dto/user-registration.dto';

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
  ) {
    super(userRepository);
  }

  async getById(id: number) {
    return await this.userRepository.findOneBy({ userId: id });
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email: email });

    if (!user) {
      return null;
    }

    return user;
  }

  async registerUser(
    userRegistrationDto: UserRegistrationDto,
  ): Promise<User | ApiResponse> {
    const user = this.userRepository.create(userRegistrationDto);
    user.passwordHash = await bcrypt.hash(userRegistrationDto.password, 10);

    try {
      const savedUser = await this.userRepository.save(user);

      if (!savedUser) {
        throw new Error('This user account cannot be created');
      }

      return savedUser;
    } catch (e) {
      return new ApiResponse(
        'error',
        -6001,
        'This user account cannot be created!',
      );
    }
  }

  async addToken(userId: number, token: string, expiresAt: string) {
    const userToken = new UserToken();
    userToken.userId = userId;
    userToken.token = token;
    userToken.expiresAt = new Date(expiresAt);

    return await this.userTokenRepository.save(userToken);
  }

  async getUserToken(token: string): Promise<UserToken | ApiResponse> {
    const userToken = await this.userTokenRepository.findOneBy({
      token: token,
    });

    if (!userToken) {
      return new ApiResponse('error', -10001, 'No such refresh token');
    }

    if (userToken.isValid === 0) {
      return new ApiResponse('error', -10003, 'The token is no longer valid!');
    }

    const currentTime = new Date();
    const expTime = new Date(userToken.expiresAt);

    if (expTime.getTime() < currentTime.getTime()) {
      return new ApiResponse('error', -10004, 'The token has expired!');
    }

    return userToken;
  }

  async invalidateToken(token: string): Promise<UserToken | ApiResponse> {
    const userToken = await this.getUserToken(token);

    if (userToken instanceof UserToken) {
      userToken.isValid = 0;
      await this.userTokenRepository.save(userToken);
    }

    return await this.getUserToken(token);
  }

  async invalidateUserTokens(
    userId: number,
  ): Promise<(UserToken | ApiResponse)[]> {
    const userTokens = await this.userTokenRepository.find({
      where: {
        userId: userId,
      },
    });

    const results = [];

    for (const userToken of userTokens) {
      results.push(await this.invalidateToken(userToken.token));
    }

    return results;
  }
}

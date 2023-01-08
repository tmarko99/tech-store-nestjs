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
  ) {
    super(userRepository);
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
}

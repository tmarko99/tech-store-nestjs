import { ApiResponse } from './../shared/api-response';
import { Administrator } from './administrator.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddAdministratorDto } from './dto/add-administrator.dto';
import * as bcrypt from 'bcrypt';
import { EditAdministratorDto } from './dto/edit-administrator.dto';

@Injectable()
export class AdministratorService {
  constructor(
    @InjectRepository(Administrator)
    private readonly administratorRepository: Repository<Administrator>,
  ) {}

  async getAll(): Promise<Administrator[]> {
    return await this.administratorRepository.find();
  }

  async getByUsername(username: string): Promise<Administrator | null> {
    const administrator = await this.administratorRepository.findOne({
      where: {
        username: username,
      },
    });

    if (!administrator) {
      return null;
    }

    return administrator;
  }

  async getById(id: number): Promise<Administrator | ApiResponse> {
    const administrator = await this.administratorRepository.findOne({
      where: {
        administratorId: id,
      },
    });

    if (!administrator) {
      return new ApiResponse(
        'error',
        -1002,
        `Administrator with given id: ${id} is not found`,
      );
    }

    return administrator;
  }

  async addAdministrator(
    addAdministratorDto: AddAdministratorDto,
  ): Promise<Administrator | ApiResponse> {
    const administrator =
      this.administratorRepository.create(addAdministratorDto);

    const salt = await bcrypt.genSalt();

    administrator.passwordHash = await bcrypt.hash(
      addAdministratorDto.password,
      salt,
    );

    return new Promise((resolve) => {
      this.administratorRepository
        .save(administrator)
        .then((admin) => resolve(admin))
        .catch((error) => {
          const response = new ApiResponse(
            'error',
            -1001,
            'Administrator with given username already exists',
          );
          resolve(response);
        });
    });
  }

  async editAdministrator(
    id: number,
    editAdministratorDto: EditAdministratorDto,
  ): Promise<Administrator | ApiResponse> {
    const administrator = await this.getById(id);

    if (administrator instanceof Administrator) {
      administrator.passwordHash = await bcrypt.hash(
        editAdministratorDto.password,
        10,
      );

      return await this.administratorRepository.save(administrator);
    }

    return administrator;
  }
}

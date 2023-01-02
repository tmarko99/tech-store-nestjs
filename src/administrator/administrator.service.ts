import { Administrator } from './administrator.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AdministratorService {
  constructor(
    @InjectRepository(Administrator)
    private readonly administratorRepository: Repository<Administrator>,
  ) {}

  async getAll(): Promise<Administrator[]> {
    return await this.administratorRepository.find();
  }

  async getById(id: number): Promise<Administrator> {
    const administrator = await this.administratorRepository.findOne({
      where: {
        administratorId: id,
      },
    });

    if (!administrator) {
      throw new NotFoundException(
        `Administrator with given id: ${id} is not found`,
      );
    }

    return administrator;
  }
}

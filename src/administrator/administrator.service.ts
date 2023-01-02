import { Administrator } from './administrator.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async addAdministrator(
    addAdministratorDto: AddAdministratorDto,
  ): Promise<Administrator> {
    const { password } = addAdministratorDto;
    const administrator =
      this.administratorRepository.create(addAdministratorDto);

    administrator.passwordHash = await bcrypt.hash(password, 10);

    return await this.administratorRepository.save(administrator);
  }

  async editAdministrator(
    id: number,
    editAdministratorDto: EditAdministratorDto,
  ): Promise<Administrator> {
    const administrator = await this.getById(id);

    administrator.passwordHash = bcrypt.hash(editAdministratorDto.password, 10);

    return await this.administratorRepository.save(administrator);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { RegisterUserDTO } from './dtos/create-user/create-user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  async findOne(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async create(input: RegisterUserDTO): Promise<User> {
    return await this.createUserUseCase.execute(input);
  }
}

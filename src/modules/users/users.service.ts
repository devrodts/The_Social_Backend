import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { RegisterUserDTO } from './dtos/create-user/create-user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UsersService {

  constructor(
    private readonly userRepository: UserRepository,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}


  async findOne(id: string): Promise<User | null> {
    return await this.userRepository.findUserById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findByUsername(username);
  }

  async create(input: RegisterUserDTO): Promise<User> {
    return await this.createUserUseCase.execute(input);
  }

}

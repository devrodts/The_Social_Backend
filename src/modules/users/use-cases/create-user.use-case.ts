import { Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { RegisterUserDTO } from '../dtos/create-user/create-user.dto';
import { User } from '../entity/user.entity';
import bcrypt from "bcryptjs"

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(registerUserDTO: RegisterUserDTO): Promise<User> {
    
    const existingUserByEmail = await this.userRepository.findByEmail(registerUserDTO.email);

    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }
    const existingUserByUsername = await this.userRepository.findByUsername(registerUserDTO.username || "");

    if (existingUserByUsername) {
      throw new ConflictException('User with this username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerUserDTO.password, 10);

    const user = {
        ...registerUserDTO,
        password: hashedPassword,
    } as User

    return await this.userRepository.createUser(user);
  }
}
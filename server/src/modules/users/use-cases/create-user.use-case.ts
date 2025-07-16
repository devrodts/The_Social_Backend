import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { RegisterUserDTO } from '../dtos/create-user/create-user.dto';
import bcrypt from "bcryptjs";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(registerUserDTO: RegisterUserDTO): Promise<User> {
    const existingUserByEmail = await this.userRepository.findOne({ where: { email: registerUserDTO.email } });
    if (existingUserByEmail) {
      throw new Error('Email already exists');
    }

    const existingUserByUsername = await this.userRepository.findOne({ where: { username: registerUserDTO.username || "" } });
    if (existingUserByUsername) {
      throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerUserDTO.password, 10);

    const user = this.userRepository.create({
      username: registerUserDTO.username,
      email: registerUserDTO.email,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }
}
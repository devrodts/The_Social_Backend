import { Injectable } from "@nestjs/common";
import { UserRepository } from "src/modules/users/repositories/user.repository";
import { RegisterInputDTO } from "../dtos/register-input.dto";
import { User } from "src/modules/users/entity/user.entity";
import * as bcrypt from "bcryptjs";
@Injectable()

export class RegisterUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RegisterInputDTO): Promise<User> {
    const existingUser = await this.userRepository.findByUsername(
      input.username,
    );

    if (existingUser) {
      throw new Error("Username already exists");
    }

    const existingEmail = await this.userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = {
      ...input,
      password: hashedPassword
    }as User

    const newUser = await this.userRepository.createUser(user);
    return this.userRepository.saveUser(newUser);
  }
}

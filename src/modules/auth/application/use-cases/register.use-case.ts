import { Injectable } from "@nestjs/common";
import { UserRepository } from "src/modules/users/domain/repository/user.repository";
import { RegisterInputDTO } from "../dtos/RegisterInputDTO";
import { User } from "src/modules/users/domain/entity/user.entity";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

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

    const newUser = new User(
      randomUUID(),
      input.username,
      input.email,
      hashedPassword,
      input.displayName,
    );
    return this.userRepository.save(newUser);
  }
}

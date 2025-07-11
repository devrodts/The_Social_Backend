import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "src/modules/users/domain/repository/user.repository";
import { RegisterInputDTO } from "../../adapters/dtos/register-input/register-input.dto";
import { AuthPayload } from "../../adapters/dtos/auth-payload/auth-payload";
import * as bcrypt from "bcryptjs";
import { LoginInputDTO } from "../../adapters/dtos/login-input/login-input.dto";
import { PasswordHashService } from "../services/password-hash.service";

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHashService: PasswordHashService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInputDTO): Promise<AuthPayload> {
    const user = await this.userRepository.findByUsername(input.username);
    if (!user) {
      throw new Error("User not found");
    }
    const isValid = await this.passwordHashService.compare(input.password, user.password);
    if (!isValid) throw new Error("invalid credentials");

    const payload = { sub: user.id, username: user.username };
    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }
}

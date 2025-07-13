import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from "../../users/entity/user.entity";
import { RegisterInputDTO } from "../dtos/register-input.dto";
import { HashService } from "../services/hash.service";
import { JwtService } from "../services";
import { AuthResponseDTO, UserResponse } from "../dtos/auth-response.dto";

@Injectable()
export class RegisterUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: RegisterInputDTO): Promise<AuthResponseDTO> {
    const existingUser = await this.userRepository.findOne({ where: { username: input.username } });
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const existingEmail = await this.userRepository.findOne({ where: { email: input.email } });
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await this.hashService.hash(input.password);

    const user = this.userRepository.create({
      username: input.username,
      email: input.email,
      password: hashedPassword,
      displayName: input.displayName,
    });

    const savedUser = await this.userRepository.save(user);

    const token = this.jwtService.sign({ userId: savedUser.id });
    const refreshToken = this.jwtService.signRefreshToken({ userId: savedUser.id });

    const userResponse = new UserResponse();
    userResponse.id = savedUser.id as any;
    userResponse.username = savedUser.username;
    userResponse.email = savedUser.email;
    userResponse.displayName = savedUser.displayName;

    const authResponse = new AuthResponseDTO();
    authResponse.token = token;
    authResponse.refreshToken = refreshToken;
    authResponse.user = userResponse;

    return authResponse;
  }
}

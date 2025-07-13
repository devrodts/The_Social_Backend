import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from "../../users/entity/user.entity";
import { LoginDTO } from "../dtos/login.dto";
import { HashService } from "../services/hash.service";
import { JwtService } from "../services";
import { AuthResponseDTO, UserResponse } from "../dtos/auth-response.dto";

@Injectable()
export class LoginUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await this.hashService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.jwtService.sign({ userId: user.id });
    const refreshToken = this.jwtService.signRefreshToken({ userId: user.id });

    const userResponse = new UserResponse();
    userResponse.id = user.id as any;
    userResponse.username = user.username;
    userResponse.email = user.email;
    userResponse.displayName = user.displayName;

    const authResponse = new AuthResponseDTO();
    authResponse.token = token;
    authResponse.refreshToken = refreshToken;
    authResponse.user = userResponse;

    return authResponse;
  }
}
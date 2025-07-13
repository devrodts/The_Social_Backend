import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from "../../users/entity/user.entity";
import { RefreshTokenDTO } from "../dtos/refresh-token.dto";
import { JwtService } from "../services";
import { AuthResponseDTO, UserResponse } from "../dtos/auth-response.dto";

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RefreshTokenDTO): Promise<AuthResponseDTO> {
    const payload = this.jwtService.verifyRefreshToken(dto.refreshToken);
    const user = await this.userRepository.findOne({ where: { id: payload.userId } });
    
    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
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
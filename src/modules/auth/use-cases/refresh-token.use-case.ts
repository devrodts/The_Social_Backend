import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '../services/jwt.service';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { RefreshTokenDTO } from '../dtos/refresh-token.dto';
import { AuthResponseDTO } from '../dtos/auth-response.dto'; // Add this import

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RefreshTokenDTO): Promise<AuthResponseDTO> {
    try {
      const payload = this.jwtService.verifyRefreshToken(dto.refreshToken);
      const user = await this.userRepository.findUserById(payload.userId);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newToken = this.jwtService.sign({ userId: user.id });

      return {
        token: newToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
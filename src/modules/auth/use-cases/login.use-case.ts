import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { LoginDTO } from '../dtos/login.dto';
import { AuthResponseDTO } from '../dtos/auth-response.dto'; // Add this import
import { HashService, JwtService } from '../services';
import { UUID } from 'crypto';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashService.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ userId: user.id });
    const refreshToken = this.jwtService.signRefreshToken({ userId: user.id });

    return {
      token,
      refreshToken,
      user: {
        id: user.id as UUID,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }
}
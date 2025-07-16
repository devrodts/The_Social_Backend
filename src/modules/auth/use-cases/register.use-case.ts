import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from "../../users/entity/user.entity";
import { RegisterInputDTO } from "../dtos/register-input.dto";
import { HashService } from "../services/hash.service";
import { JwtService } from "../services";
import { AuthResponseDTO, UserResponse } from "../dtos/auth-response.dto";
import { SanitizationService } from "../../common/services/sanitization.service";

@Injectable()
export class RegisterUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly sanitizationService: SanitizationService,
  ) {}

  async execute(input: RegisterInputDTO): Promise<AuthResponseDTO> {
    // Sanitize all input fields before processing
    const sanitizedUsername = this.sanitizationService.sanitizeUsername(input.username);
    const sanitizedEmail = this.sanitizationService.sanitizeEmail(input.email);
    const sanitizedDisplayName = this.sanitizationService.sanitizeDisplayName(input.displayName);

    const existingUser = await this.userRepository.findOne({ where: { username: sanitizedUsername } });
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const existingEmail = await this.userRepository.findOne({ where: { email: sanitizedEmail } });
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await this.hashService.hash(input.password);

    const user = this.userRepository.create({
      username: sanitizedUsername,
      email: sanitizedEmail,
      password: hashedPassword,
      displayName: sanitizedDisplayName,
    });

    const savedUser = await this.userRepository.save(user);

    const token = this.jwtService.sign({ userId: savedUser.id });
    const refreshToken = this.jwtService.signRefreshToken({ userId: savedUser.id });

    const userResponse = new UserResponse();
    userResponse.id = savedUser.id as any;
    userResponse.username = sanitizedUsername;
    userResponse.email = sanitizedEmail;
    userResponse.displayName = sanitizedDisplayName;

    const authResponse = new AuthResponseDTO();
    authResponse.token = token;
    authResponse.refreshToken = refreshToken;
    authResponse.user = userResponse;

    return authResponse;
  }
}

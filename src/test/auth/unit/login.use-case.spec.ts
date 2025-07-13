import { LoginUseCase } from "../../../modules/auth/application/use-cases/login.use-case";
import { UserRepository } from "../../../modules/users/domain/repository/user.repository";
import { JwtService } from "@nestjs/jwt";
import { PasswordHashService } from "../../../modules/auth/application/services/password-hash.service";
import { LoginInputDTO } from "../../../modules/auth/adapters/dtos/login-input/login-input.dto";
import { User } from "../../../modules/users/domain/entity/user.entity";

const mockUser: User = {
  id: "03k45n6y76-234n53o3-aspako-aposak-3n4594hen",
  username: "testuser",
  email: "test@example.com",
  password: "hashedPassword123",
  displayName: "Test User",
  followers: [],
  following: [],
  isVerified: false
};

describe("LoginUseCase", () => {
  
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let passwordHashService: jest.Mocked<PasswordHashService>;

  beforeEach(() => {
    userRepository = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as any;
    jwtService = { sign: jest.fn() } as any;
    passwordHashService = { compare: jest.fn() } as any;
    useCase = new LoginUseCase(userRepository, passwordHashService, jwtService);
  });

  it("Should authenticate with success with correct credentials", async () => {
    userRepository.findByUsername.mockResolvedValue(mockUser);
    passwordHashService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue("jwt-token-123");

    const input: LoginInputDTO = { username: "testuser", password: "password123" };
    const result = await useCase.execute(input);

    expect(result).toEqual({ token: "jwt-token-123", user: mockUser });
    expect(userRepository.findByUsername).toHaveBeenCalledWith("testuser");
    expect(passwordHashService.compare).toHaveBeenCalledWith("password123", mockUser.password);
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, username: mockUser.username });
  });

  it("Should throw a error when user not found", async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    const input: LoginInputDTO = { username: "notfound", password: "any" };
    await expect(useCase.execute(input)).rejects.toThrow("User not found");
    expect(userRepository.findByUsername).toHaveBeenCalledWith("notfound");
    expect(passwordHashService.compare).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it("deve lançar erro se a senha for inválida", async () => {
    userRepository.findByUsername.mockResolvedValue(mockUser);
    passwordHashService.compare.mockResolvedValue(false);
    const input: LoginInputDTO = { username: "testuser", password: "wrong" };
    await expect(useCase.execute(input)).rejects.toThrow("invalid credentials");
    expect(userRepository.findByUsername).toHaveBeenCalledWith("testuser");
    expect(passwordHashService.compare).toHaveBeenCalledWith("wrong", mockUser.password);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});

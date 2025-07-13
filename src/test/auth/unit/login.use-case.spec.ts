import { LoginUseCase } from "../../../modules/auth/use-cases/login.use-case";
import { UserRepository } from "../../../modules/users/repositories/user.repository";
import { JwtService } from "../../../modules/auth/services/jwt.service";
import { HashService } from "../../../modules/auth/services/hash.service";
import { LoginDTO } from "src/modules/auth/dtos/login.dto";
import { User } from "../../../modules/users/entity/user.entity";
const mockUser: User = {
  id: "03k45n6y76-234n53o3-aspako-aposak-3n4594hen",
  username: "testuser",
  email: "test@example.com",
  password: "hashedPassword123",
  displayName: "Test User",
  followers: [],
  following: [],
  isVerified: false,
  bio: "test bio",
  avatar: "test avatar",
  createdAt: new Date(),
  updatedAt: new Date(),
  tweets: [],
  likes: [],
  tweetsCount: 3,
  followingCount: 100,
  followersCount: 200,
  likesCount: 10,
};

describe("LoginUseCase", () => {
  
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let hashService: jest.Mocked<HashService>;

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
    jwtService = { sign: jest.fn(), signRefreshToken: jest.fn() } as any;
    hashService = { 
      compare: jest.fn(),
      hash: jest.fn(),
      generateSalt: jest.fn(),
      saltRounds: 10
    } as any;
    useCase = new LoginUseCase(userRepository, hashService, jwtService);
  });

  it("Should authenticate with success with correct credentials", async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    hashService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue("jwt-token-123");
    jwtService.signRefreshToken.mockReturnValue("refresh-token-123");

    const input: LoginDTO = { email: "test@test.com.br", password: "password123" };
    const result = await useCase.execute(input);

    expect(result).toEqual({ 
      token: "jwt-token-123", 
      refreshToken: "refresh-token-123",
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        displayName: mockUser.displayName,
      }
    });
    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@test.com.br");
    expect(hashService.compare).toHaveBeenCalledWith("password123", mockUser.password);
    expect(jwtService.sign).toHaveBeenCalledWith({ userId: mockUser.id });
  });

  it("Should throw a error when user not found", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    const input: LoginDTO = { email: "test@test.com.brr", password: "any" };
    await expect(useCase.execute(input)).rejects.toThrow("Invalid credentials");
    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@test.com.brr");
    expect(hashService.compare).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it("deve lançar erro se a senha for inválida", async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    hashService.compare.mockResolvedValue(false);
    const input: LoginDTO = { email: "test@test.com.br", password: "wrong" };
    await expect(useCase.execute(input)).rejects.toThrow("Invalid credentials");
    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@test.com.br");
    expect(hashService.compare).toHaveBeenCalledWith("wrong", mockUser.password);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});

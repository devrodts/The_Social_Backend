import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { RegisterUseCase } from "src/modules/auth/application/use-cases/register.use-case";
import { LoginUseCase } from "src/modules/auth/application/use-cases/login.use-case";
import { RegisterInputDTO } from "src/modules/auth/adapters/dtos/register-input/register-input.dto";
import { AuthPayload } from "src/modules/auth/adapters/dtos/auth-payload/auth-payload";
import { LoginInputDTO } from "../../dtos/login-input/login-input.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";

@Resolver()
export class AuthResolver {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @Mutation(() => AuthPayload)
  async register(@Args("input") input: RegisterInputDTO): Promise<AuthPayload> {
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await this.registerUseCase.execute({
      ...input,
      password: hashedPassword,
    });
    const payload = { sub: user.id, username: user.username };
    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }
  
  @Mutation(() => AuthPayload)
  async login(@Args("input") input: LoginInputDTO): Promise<AuthPayload> {
    const authPayload = await this.loginUseCase.execute(input);

    if(!authPayload){
      throw new Error("invalid credentials");
    }

    const payload = { sub: authPayload.user.id, username: authPayload.user.username };
    return {  
      token: this.jwtService.sign(payload),
      user: authPayload.user,
    };
  }
}
